from pytube import YouTube
from moviepy.editor import *
import sys
def progress_func(stream, chunk, bytes_remaining):
    curr = stream.filesize - bytes_remaining
    done = int(50 * curr / stream.filesize)
    sys.stdout.write("\r[{}{}] ".format('=' * done, ' ' * (50-done)) )
    sys.stdout.flush()

url = sys.argv[1]
print(url)
YouTube(url,on_progress_callback=progress_func).streams.filter(res='720p',file_extension='mp4').first().download(output_path='D:\MV',filename='clip.mp4')

clip = VideoFileClip("D:\MV\clip.mp4")
outro = VideoFileClip("D:\MV\outro.mp4")
outro = outro.without_audio()
clip = clip.without_audio()  
final = clip.fx(vfx.speedx, 30)
final = final.cutout(0,2) 
final = final.cutout(7,9)

final = concatenate_videoclips([final,outro])
final.write_videofile('D:/MV/edit_output/edit.mp4')
