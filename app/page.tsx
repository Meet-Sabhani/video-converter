"use client";

import { useState, useEffect } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import vG from "../public/videos/Game-hanger.mkv";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [convertedVideoUrl, setConvertedVideoUrl] = useState<string | null>(
    null
  );
  const [ffmpeg, setFfmpeg] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState("mp4");
  const [resolution, setResolution] = useState("1280:720");

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpegInstance = createFFmpeg({ log: true });
      await ffmpegInstance.load();
      setFfmpeg(ffmpegInstance);
      setIsReady(true);
    };
    loadFFmpeg();
  }, []);

  const convertVideo = async () => {
    if (!ffmpeg) return;
    setIsProcessing(true);

    ffmpeg.FS("writeFile", "input.mkv", await fetchFile(vG));
    await ffmpeg.run(
      "-i",
      "input.mkv",
      "-vf",
      `scale=${resolution}`,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-c:a",
      "aac",
      `output.${format}`
    );

    const data = ffmpeg.FS("readFile", `output.${format}`);
    const videoBlob = new Blob([data.buffer], { type: `video/${format}` });
    const url = URL.createObjectURL(videoBlob);
    setConvertedVideoUrl(url);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5">
      <h1 className="text-3xl font-bold mb-5">Video Streaming & Conversion</h1>
      <Card className="w-full max-w-md p-4">
        <CardContent>
          <h2 className="text-lg font-semibold mb-3">
            Select Format & Resolution
          </h2>
          <Select value={format} onChange={(e) => setFormat(e?.target?.value)}>
            <SelectItem value="mp4">MP4</SelectItem>
            <SelectItem value="avi">AVI</SelectItem>
            <SelectItem value="mov">MOV</SelectItem>
          </Select>
          <Select
            value={resolution}
            onChange={(e) => setResolution(e?.target?.value)}
          >
            <SelectItem value="1920:1080">1080p (Full HD)</SelectItem>
            <SelectItem value="1280:720">720p (HD)</SelectItem>
            <SelectItem value="854:480">480p (SD)</SelectItem>
          </Select>
          <Button
            className="mt-4 w-full"
            onClick={convertVideo}
            disabled={!isReady || isProcessing}
          >
            {isProcessing ? "Processing..." : "Convert & Download"}
          </Button>
        </CardContent>
      </Card>
      {convertedVideoUrl && (
        <div className="mt-5">
          <video controls className="w-full max-w-md">
            <source src={convertedVideoUrl} type={`video/${format}`} />
            Your browser does not support the video tag.
          </video>
          <a
            href={convertedVideoUrl}
            download={`converted_video.${format}`}
            className="block mt-3 text-blue-500 underline"
          >
            Download Converted Video
          </a>
        </div>
      )}
      {!isReady && (
        <p className="mt-5 text-gray-500">
          Loading conversion tools… please wait.
        </p>
      )}
    </div>
  );
}
