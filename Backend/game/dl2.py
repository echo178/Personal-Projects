from moviepy.editor import *
import sys

video1 = VideoFileClip(r"C:\Users\Kyaw Zayar Tun\Documents\MiniTool uTube Downloader\Screen Record\DOI_20221027.mp4")
video2 = VideoFileClip(r"C:\Users\Kyaw Zayar Tun\Documents\MiniTool uTube Downloader\Screen Record\DOI_20221027_2.mp4")
final = concatenate_videoclips([video1,video2])
final.write_videofile(r"C:\Users\Kyaw Zayar Tun\Documents\MiniTool uTube Downloader\Screen Record\DOI_20221027_FULL.mp4")