<?php

namespace App\Jobs;

use App\Constants\Srs;
use App\Helpers\SrsHelper;
use App\Models\Task;
use App\Models\UploadedFile;
use File;
use Process;
use Storage;

class HandleReadFileJob extends AJob
{
    protected $type = 'READ_FILE';
    public $timeout = 0;
    /**
     * Create a new job instance.
     */

    protected $data;
    protected $task;
    public function __construct(Task $task, UploadedFile $data)
    {
        parent::__construct($task);
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->cb_handle(function ($cb_show) {
            $file_extension = File::extension($this->data->path);

            $disk = Storage::disk('public');
            if ($file_extension == "dwg") {
                $cb_show("Convert {$this->data->name} to dxf start");
                $dxf_path = $this->convertDWG2DXF($disk->path('files/upload/' . $this->data->uuid));
                $this->data->dxf_path = $dxf_path;
                $cb_show("Convert {$this->data->name} to dxf start done");
            }

            $cb_show("Reading {$this->data->name} information start");

            $extent = $this->getExtent($this->data->dxf_path);
            if ($extent[0] >= $extent[2] || $extent[1] >= $extent[3]) {
                throw new \Exception("Invalid bounding box!! Please change Coordinate Reference System");
            }
            $cb_show("Reading bounding box done");

            $layers = $this->getLayers($this->data->dxf_path);
            $cb_show("Reading all layers done");

            $geometry_types = $this->getGeometryType($this->data->dxf_path);
            $cb_show("Reading all geometry types done");

            $cb_show("Reading {$this->data->name} information done");

            $srs_default = Srs::DEFAULT;
            if ($this->data->srs != $srs_default) {
                $cb_show("Convert bounding box's in {$this->data->srs} to $srs_default start");
                $t_min_point = SrsHelper::transformCoordinate($this->data->srs, $srs_default, $extent[0], $extent[1]);
                $t_max_point = SrsHelper::transformCoordinate($this->data->srs, $srs_default, $extent[2], $extent[3]);
                $cb_show("Convert bounding box's in {$this->data->srs} to $srs_default done");
            }

            $this->data->metadata = [
                "bbox" => [
                    $t_min_point[0] ?? $extent[0],
                    $t_min_point[1] ?? $extent[1],
                    $t_max_point[0] ?? $extent[2],
                    $t_max_point[1] ?? $extent[3],
                    "srs" => $srs_default,
                ],
                'layers' => $layers,
                'geometry_types' => $geometry_types,
            ];
            $this->data->is_read_done = 1;
            $this->data->save();
            $cb_show("Reading file {$this->data->name} done");
        });
    }

    public function failed(\Exception $exception)
    {
        $data = $this->data;
        $this->cb_failed($exception, function ($cb_show) use ($data) {
            if (File::exists($data->path)) {
                File::delete($data->path);
            }
            if (!empty($data->dxf_path) && File::exists($data->dxf_path)) {
                File::delete($data->dxf_path);
            }
            $data->delete();
        });
    }

    private function getExtent(string $file_path): array
    {
        $cmd = config('tool.ogrinfo_path');
        $cmd .= " -al -so {$file_path}";
        $process = Process::run($cmd);
        $output = $process->output();
        if ($process->failed()) {
            throw new \Exception($output);
        }
        $output = preg_split("/\r\n|\n|\r/", $output);
        $extent = array_values(array_filter($output, function ($item) {
            $item = mb_strtolower($item);
            if (str_contains($item, "extent:")) {
                return true;
            }
            return false;

        }))[0];
        $extent = mb_strtolower($extent);
        $extent = str_replace("extent: ", "", $extent);
        $extent = str_replace("(", "", $extent);
        $extent = str_replace(")", "", $extent);
        $extent = str_replace(" - ", ", ", $extent);
        $extent = explode(", ", $extent);
        $extent = array_map(function ($item) {
            return (float) $item;
        }, $extent);
        return $extent;
    }

    private function getLayers(string $file_path): array
    {
        $cmd = config('tool.ogrinfo_path');
        $cmd .= " -sql \"SELECT DISTINCT layer FROM entities\"";
        $cmd .= " $file_path";
        $process = Process::run($cmd);
        $output = $process->output();
        if ($process->failed()) {
            throw new \Exception($output);
        }
        $output = preg_split("/\r\n|\n|\r/", $output);
        $layers = array_values(array_filter($output, function ($item) {
            $item = mb_strtolower($item);
            if (str_contains($item, "layer (string)")) {
                return true;
            }
            return false;
        }));
        $layers = array_map(function ($layer) {
            return str_replace("  layer (String) = ", "", $layer);
        }, $layers);

        return $layers;
    }

    private function getGeometryType(string $file_path): array
    {
        $cmd = config('tool.ogrinfo_path');
        $cmd .= " -sql \"SELECT DISTINCT ogr_geometry FROM entities\"";
        $cmd .= " $file_path";
        $process = Process::run($cmd);
        $output = $process->output();
        if ($process->failed()) {
            throw new \Exception($output);
        }
        $output = preg_split("/\r\n|\n|\r/", $output);
        $geometry_types = array_values(array_filter($output, function ($item) {
            $item = mb_strtolower($item);
            if (str_contains($item, "ogr_geometry (string)")) {
                return true;
            }
            return false;
        }));
        $geometry_types = array_map(function ($geometry_type) {
            return str_replace("  ogr_geometry (String) = ", "", $geometry_type);
        }, $geometry_types);

        return $geometry_types;
    }

    private function convertDWG2DXF(string $path): string
    {
        $cmd = config('tool.teigha_path');
        $cmd .= " $path $path";
        $cmd .= ' ACAD2018 DXF 0 1 "*.DWG"';
        $process = Process::run($cmd);
        if ($process->failed()) {
            $error = $process->output();
            if (empty($error)) {
                $error = "Can not convert dwg to dxf";
            }
            throw new \Exception($error);
        }

        $files = File::files($path);
        try {
            $dxf_file = array_values(array_filter($files, function ($file) {
                if ($file->getExtension() == 'dxf') {
                    return true;
                }
                return false;
            }))[0];
        } catch (\Exception $e) {
            throw new \Exception("File not exist");
        }

        return $dxf_file->getRealPath();
    }
}
