if (!(window.File || window.FileReader || window.FileList || window.Blob)) {
    alert('你妈喊你换Chrome浏览器啦');
}

class Util {
    clearString(text) {
        var fix_text = text.replace(/^\s+|\s+$/g, '');
        return fix_text;
    }
}

// 全局变量
var origin_array = [];
var fix_array = [];
var utilTool = new Util();

$(document).ready(function () {
    $(".choose_file").click(function (event) {
        $("#files").click();
        $("#files").change(function () {
            $(".show_fixed").val('');
            $("#file_list").empty();
            var files_input = $("#files");
            var file_length = files_input[0].files.length;
            var items = files_input[0].files;
            var fragment = "";

            if (file_length > 0) {
                for (var i = 0; i < file_length; i++) {
                    var file_name = items[i].name;
                    fragment += "<li>" + file_name + "</li>"
                }
            }
            $("#file_list").append(fragment);

            // 读取内容
            let selectedFile = document.getElementById('files').files[0];
            let reader = new FileReader(); // 读取TXT起重要作用的
            reader.readAsText(selectedFile);
            reader.onload = oFREvent => { // 读取完毕从中取值
                let pointsTxt = oFREvent.target.result;
                analysis(pointsTxt);
            };

            // 下一个
            $(".next_btn").click(function () {
                // 读取修改的句子
                var fix_text = $(".fix_text").val();
                fix_text = utilTool.clearString(fix_text);
                if (fix_text.length == 0) {
                    var fix = "0 " + $(".origin_text").val();
                    fix_text = fix;
                }
                fix_text = utilTool.clearString(fix_text);
                if (fix_text.length > 0 && (fix_text != '0')) // 需要加别的么。。。算了吧  
                    fix_array.push(fix_text);
                    // 展示已经修改的
                    showFixed();
                
                // 删除原数组第一个元素
                origin_array.shift();
                // 判断是否还有
                if (origin_array.length > 0) {
                    $(".origin_text").val(origin_array[0]);
                } else {
                    alert("换下一个吧hxd");
                    var fixed_text = $(".show_fixed").val();
                    var blob = new Blob([fixed_text], {
                        type: "text/plain;charset=utf-8"
                    });
                    saveAs(blob, file_name);
                    location.reload();
                }
                $(".fix_text").val("");
            });

            // 解析显示
            function analysis(text) {
                origin_array = text.split('。');
                for (var i = 0; i < origin_array.length; i++) {
                    origin_array[i] = utilTool.clearString(origin_array[i]);
                }
                $(".origin_text").val(origin_array[0]);
            }

            $(".option").click(function () {
                var origin = $(".origin_text").val();
                fixOriginText(origin, $(this.name))
            });

            // 修改
            function fixOriginText(origin, option_title) {
                var fix_sentence = "";
                switch (option_title.selector) {
                    case "实例":
                        fix_sentence = "1 " + origin + "。";
                        break;
                    case "操作员":
                        fix_sentence = "3 " + origin + "。";
                        break;
                    case "发生国":
                        fix_sentence = "5 " + origin + "。";
                        break;
                    case "战争":
                        fix_sentence = "6 " + origin + "。";
                        break;
                    case "武器":
                        fix_sentence = "7 " + origin + "。";
                        break;
                    case "设计者":
                        fix_sentence = "9 " + origin + "。";
                        break;
                    default:
                        console.log("出错了哦");
                }
                $(".fix_text").val(fix_sentence);
            }
            
            // 展示
            function showFixed() {
                var fixed_title = $(".show_fixed").val();
                fixed_title += fix_array[fix_array.length - 1] + "\n";
                $(".show_fixed").val(fixed_title);
            }

        })

    });
});