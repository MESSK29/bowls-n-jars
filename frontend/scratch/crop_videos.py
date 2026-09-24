import sys
from moviepy import VideoFileClip

def crop_center(video_path, output_path, target_ratio=9/16):
    clip = VideoFileClip(video_path)
    w, h = clip.size
    current_ratio = w / h

    if current_ratio > target_ratio:
        # Video is wider than target ratio. Crop width.
        new_w = int(h * target_ratio)
        x_center = w / 2
        x1 = x_center - new_w / 2
        x2 = x_center + new_w / 2
        cropped_clip = clip.cropped(x1=x1, y1=0, x2=x2, y2=h)
    else:
        # Video is taller than target ratio. Crop height.
        new_h = int(w / target_ratio)
        y_center = h / 2
        y1 = y_center - new_h / 2
        y2 = y_center + new_h / 2
        cropped_clip = clip.cropped(x1=0, y1=y1, x2=w, y2=y2)

    # Remove audio if you want to keep file size small, or just write
    cropped_clip.write_videofile(output_path, codec="libx264", audio=False)

if __name__ == "__main__":
    crop_center("f:/bowls n jars/frontend/public/videos/video1.mp4", "f:/bowls n jars/frontend/public/videos/video1_mobile.mp4")
    crop_center("f:/bowls n jars/frontend/public/videos/video2.mp4", "f:/bowls n jars/frontend/public/videos/video2_mobile.mp4")
