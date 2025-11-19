import React, { useState, useRef, useEffect } from "react";
import { X, Check, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "../ui/Button";

interface ImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export function ImageCropper({
  imageFile,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const container = containerRef.current;
    if (!canvas || !image || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create a temporary canvas to draw the transformed image
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Set dimensions for the cropped output (visible area)
    // For simplicity, we'll crop what's visible in the container
    // or a fixed aspect ratio box in the center.
    // Let's go with a fixed box in the center of the container for now,
    // or just crop the whole image with current transformations.

    // Actually, a common simple cropper behavior is to crop the visible area of the image
    // relative to a "viewport".
    // Let's implement a simple version: Draw the image with transforms onto a canvas
    // that matches the original image size, but cropped?

    // Better approach for this custom implementation without libraries:
    // Draw the image onto a canvas with current scale/rotation/position applied.
    // But determining the exact crop rect is tricky without a UI overlay.

    // Let's simplify: Just apply rotation and return the image,
    // OR if we want true cropping, we need a selection box.
    // Given the "crop" requirement, let's assume the user wants to trim edges.
    // We'll implement a simpler "Confirm Image" that just processes the rotation for now,
    // as full manual cropping UI is complex to build from scratch in one go.
    // Wait, the user asked for "option to crop the image".
    // Let's try to implement a basic center crop or just allow them to see the image and confirm it.

    // REVISED PLAN for simple custom cropper:
    // 1. Show image.
    // 2. Allow Zoom/Pan/Rotate.
    // 3. "Crop" captures the current view in the container.

    const pixelRatio = window.devicePixelRatio || 1;
    const containerRect = container.getBoundingClientRect();

    // We want to capture exactly what is visible in the container
    canvas.width = containerRect.width * pixelRatio;
    canvas.height = containerRect.height * pixelRatio;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, containerRect.width, containerRect.height);

    // Calculate draw position
    // The image is centered by default + position offset
    const centerX = containerRect.width / 2 + position.x;
    const centerY = containerRect.height / 2 + position.y;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) onCropComplete(blob);
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">Edit Image</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div
          ref={containerRef}
          className="flex-1 bg-gray-900 overflow-hidden relative cursor-move min-h-[400px]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imageSrc && (
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              className="absolute max-w-none pointer-events-none"
              style={{
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                left: "50%",
                top: "50%",
              }}
              draggable={false}
            />
          )}
          {/* Overlay to show crop area - for now we crop the whole visible area */}
          <div className="absolute inset-0 pointer-events-none border-2 border-white/50"></div>
        </div>

        <div className="p-4 bg-gray-50 border-t space-y-4">
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale((s) => Math.min(3, s + 0.1))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation((r) => r + 90)}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleCrop} className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Done
            </Button>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
