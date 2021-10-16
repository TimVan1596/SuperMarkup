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

var keywords = ['是一款', '开发', '设计', '研制', '订购', '国空军', '国海军', '国陆军'
    , '采购', '第二次世界大战', '二战', '搭载', '战场上', '战争中', '参与过', '可以发射', '设计'
    , '是一款', '是一个', '一战', '第一次世界大战', '改进', '装备']


//注意：导航 依赖 element 模块，否则无法进行功能性操作
layui.use('element', function () {
    var element = layui.element;

    // 初始化
    $(".fix_text").val('');
    $(".show_fixed").val('');


    $("#uploadFromTextBtn").click(function () {
        // 审核备注
        layer.prompt({
            formType: 2,
            maxlength: 10240,
            title: '直接复制文本到这里',
            area: ['500px', '150px'],
        }, function (value, index, elem) {

            analysis(value)
            layer.close(index);
            return value;
        });
    });


    $(".choose_file").click(function (event) {
        $("#files").click();
        $("#files").change(function () {
            $(".fix_text").val('');
            $(".show_fixed").val('');
            $("#file_list").empty();
            var files_input = $("#files");
            var file_length = files_input[0].files.length;
            var items = files_input[0].files;
            var fragment = "";
            var fileName = "";
            if (file_length > 0) {
                for (var i = 0; i < file_length; i++) {
                    fileName = items[i].name;
                    fragment += "<li>" + fileName + "</li>"
                }
            }
            $("#card-title").text(fileName)

            // 读取内容
            let selectedFile = document.getElementById('files').files[0];
            let reader = new FileReader(); // 读取TXT起重要作用的
            reader.readAsText(selectedFile);
            reader.onload = oFREvent => { // 读取完毕从中取值
                let pointsTxt = oFREvent.target.result;
                analysis(pointsTxt);
            };


        })

    });

    // 下一个
    $("#next-btn").click(function () {
        // 读取修改的句子
        var fix_text = $(".fix_text").val();
        fix_text = utilTool.clearString(fix_text);
        if (fix_text.length == 0) {
            var fix = "0 " + $("#origin-text").text();
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
            $("#origin-text").text(origin_array[0]);
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

        // textarea自动换行
        var obj = document.getElementById("show-fixed-ta");
        obj.scrollTop = obj.scrollHeight;

    });

    // 解析并显示
    function analysis(text) {
        origin_array = text.split('。');
        for (var i = 0; i < origin_array.length; i++) {
            origin_array[i] = utilTool.clearString(origin_array[i]);
        }
        var firstText = origin_array[0];
        // firstText = '<span style="color: #0000FF">' + firstText + '</span>';
        firstText = textHighlight(firstText, keywords);
        $("#origin-text").html(firstText);
    }

    $(".options-btn").click(function () {
        var origin = $("#origin-text").text();
        if (origin.length > 0) {
            fixOriginText(origin, $(this.name))
        } else {
            layer.msg('未选择文本')
        }

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
                layer.msg("出错了哦");

        }
        var originVal = $(".fix_text").val();

        $(".fix_text").val(originVal + fix_sentence + '\n');
    }

    // 展示
    function showFixed() {
        var fixed_title = $(".show_fixed").val();
        fixed_title += fix_array[fix_array.length - 1] + "\n";
        $(".show_fixed").val(fixed_title);
    }

    //文字中符合关键词的高亮
    function textHighlight(text, keywords) {
        var len = keywords.length
        for (var i = 0; i < len; i++) {
            var keyword = keywords[i]
            text = text.replace(keyword, "<span style='color: #1E9FFF'>" + keyword + "</span>")
        }
        return text;
    }

});