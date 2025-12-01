# dds转png/jpg转换器

```Python
import os
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image
import threading
import time

class DDSConverter:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("DDS转JPG/PNG转换器")
        self.root.geometry("500x500")
        
        # 创建GUI界面
        self.create_widgets()
        
        # 获取桌面路径
        self.desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
        
    def create_widgets(self):
        """创建GUI控件"""
        # 标题
        title_label = tk.Label(self.root, text="DDS文件转换器", font=("Arial", 16, "bold"))
        title_label.pack(pady=10)
        
        # 选择文件夹按钮
        self.select_infolder_btn = tk.Button(self.root, text="选择源文件夹", 
                                   command=self.select_infolder, 
                                   font=("Arial", 12), 
                                   bg="#4CAF50", 
                                   fg="white",
                                   width=20,
                                   height=2)
        self.select_infolder_btn.pack(pady=10)
        
        # 选择的文件夹路径显示
        self.path_infolder_label = tk.Label(self.root, text="未选择源文件夹", wraplength=400)
        self.path_infolder_label.pack(pady=5)
        
        # 选择文件夹按钮
        self.select_outfolder_btn = tk.Button(self.root, text="选择目标文件夹", 
                                   command=self.select_outfolder, 
                                   font=("Arial", 12), 
                                   bg="#4CAF50", 
                                   fg="white",
                                   width=20,
                                   height=2)
        self.select_outfolder_btn.pack(pady=10)
        
        # 选择的文件夹路径显示
        self.path_outfolder_label = tk.Label(self.root, text="未选择目标文件夹", wraplength=400)
        self.path_outfolder_label.pack(pady=5)
        
        # 格式选择
        format_frame = tk.Frame(self.root)
        format_frame.pack(pady=10)
        
        tk.Label(format_frame, text="输出格式:").pack(side=tk.LEFT)
        
        self.format_var = tk.StringVar(value="PNG")
        tk.Radiobutton(format_frame, text="PNG", variable=self.format_var, value="PNG").pack(side=tk.LEFT, padx=10)
        tk.Radiobutton(format_frame, text="JPG", variable=self.format_var, value="JPG").pack(side=tk.LEFT, padx=10)
        
        # 转换按钮
        self.convert_btn = tk.Button(self.root, text="开始转换", 
                                    command=self.start_conversion, 
                                    font=("Arial", 12), 
                                    bg="#2196F3", 
                                    fg="white",
                                    width=20,
                                    height=2,
                                    state=tk.DISABLED)
        self.convert_btn.pack(pady=20)
        
        # 进度显示
        self.progress_label = tk.Label(self.root, text="")
        self.progress_label.pack(pady=5)
        
    def select_infolder(self):
        """选择源文件夹"""
        folder_path = filedialog.askdirectory(title="选择包含DDS文件的文件夹")
        if folder_path:
            self.source_folder = folder_path
            self.path_infolder_label.config(text=f"已选择: {folder_path}")
            self.convert_btn.config(state=tk.NORMAL)
            
    def select_outfolder(self):
        """选择目标文件夹"""
        folder_path = filedialog.askdirectory(title="选择目标文件夹")
        if folder_path:
            self.output_folder = folder_path
            self.path_outfolder_label.config(text=f"已选择: {folder_path}")
            self.convert_btn.config(state=tk.NORMAL)
    
    def start_conversion(self):
        """开始转换过程"""
        if not hasattr(self, 'source_folder'):
            messagebox.showerror("错误", "请先选择源文件夹")
            return
            
        # 在后台线程中运行转换，避免界面冻结
        thread = threading.Thread(target=self.convert_dds_files)
        thread.daemon = True
        thread.start()
    
    def find_dds_files(self, folder):
        """递归查找所有DDS文件"""
        dds_files = []
        for root, dirs, files in os.walk(folder):
            for file in files:
                if file.lower().endswith('.dds'):
                    dds_files.append(os.path.join(root, file))
        return dds_files
    
    def convert_dds_files(self):
        """转换DDS文件"""
        try:
            # 禁用按钮，防止重复点击
            self.convert_btn.config(state=tk.DISABLED)
            self.select_infolder_btn.config(state=tk.DISABLED)
            self.select_outfolder_btn.config(state=tk.DISABLED)
            
            # 在桌面上创建输出文件夹
            output_folder_name = f"DDS转换结果_{time.strftime('%Y%m%d_%H%M%S')}"
            output_base_path = os.path.join(self.output_folder, output_folder_name)
            
            # 查找所有DDS文件
            self.progress_label.config(text="正在搜索DDS文件...")
            dds_files = self.find_dds_files(self.source_folder)
            
            if not dds_files:
                messagebox.showinfo("提示", "在所选文件夹中未找到任何DDS文件")
                self.reset_buttons()
                return
                
            total_files = len(dds_files)
            converted_count = 0
            failed_files = []
            
            self.progress_label.config(text=f"找到 {total_files} 个DDS文件，开始转换...")
            
            # 转换每个DDS文件
            for dds_file in dds_files:
                try:
                    # 计算相对路径
                    relative_path = os.path.relpath(dds_file, self.source_folder)
                    # 构建输出路径
                    output_file_path = os.path.join(output_base_path, relative_path)
                    # 更改扩展名
                    output_file_path = os.path.splitext(output_file_path)[0] + f".{self.format_var.get().lower()}"
                    
                    # 创建输出目录
                    os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
                    
                    # 转换DDS文件
                    with Image.open(dds_file) as img:
                        # 转换为RGB模式（JPG不支持RGBA）
                        if self.format_var.get() == "JPG" and img.mode in ('RGBA', 'LA'):
                            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                            rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                            rgb_img.save(output_file_path, 'JPEG', quality=95)
                        else:
                            img.save(output_file_path, self.format_var.get())
                    
                    converted_count += 1
                    
                    # 更新进度
                    progress_percent = (converted_count / total_files) * 100
                    self.progress_label.config(
                        text=f"进度: {converted_count}/{total_files} ({progress_percent:.1f}%) - 正在转换: {os.path.basename(dds_file)}"
                    )
                    
                except Exception as e:
                    failed_files.append((dds_file, str(e)))
                    print(f"转换失败 {dds_file}: {e}")
            
            # 显示结果
            result_message = f"转换完成!\n成功: {converted_count}/{total_files}"
            if failed_files:
                result_message += f"\n失败: {len(failed_files)} 个文件"
                
                # 创建错误日志
                error_log_path = os.path.join(output_base_path, "转换错误日志.txt")
                with open(error_log_path, 'w', encoding='utf-8') as f:
                    f.write("转换失败的文件列表:\n\n")
                    for file_path, error in failed_files:
                        f.write(f"文件: {file_path}\n错误: {error}\n\n")
            
            messagebox.showinfo("转换完成", result_message)
            self.progress_label.config(text="转换完成!")
            
            # 打开输出文件夹
            if os.path.exists(output_base_path):
                os.startfile(output_base_path)  # Windows
                # 对于Mac: os.system(f'open "{output_base_path}"')
                # 对于Linux: os.system(f'xdg-open "{output_base_path}"')
            
        except Exception as e:
            messagebox.showerror("错误", f"转换过程中发生错误: {str(e)}")
        finally:
            self.reset_buttons()
    
    def reset_buttons(self):
        """重置按钮状态"""
        self.convert_btn.config(state=tk.NORMAL)
        self.select_infolder_btn.config(state=tk.NORMAL)
        self.select_outfolder_btn.config(state=tk.NORMAL)
    
    def run(self):
        """运行程序"""
        self.root.mainloop()

def main():
    """主函数"""
    # 检查依赖库
    try:
        from PIL import Image
    except ImportError:
        print("请先安装Pillow库: pip install Pillow")
        return
    
    # 运行转换器
    converter = DDSConverter()
    converter.run()

if __name__ == "__main__":
    main()
```
