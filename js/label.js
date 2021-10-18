if (!(window.File || window.FileReader || window.FileList || window.Blob)) {
    alert('你妈喊你换Chrome浏览器啦');
}

class Util {
    clearString(text) {
        var fix_text = text.replace(/^\s+|\s+$/g, '');
        return fix_text;
    }
}

/** 全局变量
 *  origin_array = 从源文件按照句号分割的全部段落
 *  originLength = 句段总个数
 * */
var origin_array = [];
var fixArray = [];
var utilTool = new Util();
var fileName = "";
var originLength;

var keywords = ['是一款', '开发', '设计', '使用国家', '使用国', '研制', '订购', '国空军', '国海军'
    , '国陆军', '生产国家', '生产国', '拥有国家', '拥有国', '开发公司', '研发公司', '产地', '制造国'
    , '采购', '第二次世界大战', '二战', '搭载', '战场上', '战争中', '参与过', '可以发射', '设计'
    , '是一款', '是一个', '一战', '第一次世界大战', '改进', '装备', '是一', '使用', '产地'
    , '战场上', '战争中', '参与过', '战役', '属于', '服役', '配属']
var regexs = [/(是|属于|服役)([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_])*(舰|艇|机|船)/g, /驻([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_])*(部队|军队|海军|陆军|空军)/g, /采购([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_])*(架|台|量)/g
    , /由([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_])*(研制|研发|设计|装备)/g, /(是|属于|服役)([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_])*的/g, /在([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_])*(战场|战争|大战|战|战役)/g];
keywords = regexs.concat(keywords)


layui.config({
    base: 'js/'
}).extend({
    ClipboardJS: 'clipboard.min'
});

//注意：导航 依赖 element 模块，否则无法进行功能性操作
layui.use(['element', 'layer', 'ClipboardJS'], function () {
    var element = layui.element;
    var ClipboardJS = layui.ClipboardJS;

    var clipboard = new ClipboardJS("#copy-btn");
    clipboard.on("success", function (e) {
        layer.msg('已将结果复制到剪切板');
        e.clearSelection();
    });

    //
    // clipboard.on('error', function (e) {
    //     document.querySelector('.copy');
    //     alert("复制失败,请记住下必须付款的金额 不能多不能少否则不能成功");
    // });

    // 初始化
    $(".fix_text").val('');
    $(".show_fixed").val('');


    $("#uploadFromTextBtn").click(function () {
        // 审核备注
        layer.prompt({
            formType: 2,
            maxlength: 32768,
            title: '直接复制文本到这里',
            area: ['480px', '192px'],
        }, function (value, index, elem) {
            fileName = 'temp.txt'
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
            fileName = "";
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
        var fixText = $(".fix_text").val();
        var originText = $("#origin-text").text();
        console.log('origin_array')
        if (origin_array.length <= 0) {
            //询问框
            layer.confirm('换下一个吧hxd？', {
                btn: ['好的', '再改改'] //按钮
            }, function () {
                var fixed_text = $(".show_fixed").val();
                var blob = new Blob([fixed_text], {
                    type: "text/plain;charset=utf-8"
                });
                var newFileName = getFileName(fileName) + '_new' + getExtension(fileName)
                saveAs(blob, newFileName);
                location.reload();
            }, function () {
            });
            return
        } else {

        }
        fixText = utilTool.clearString(fixText);
        // 如果没有进行修改默认为0（未选择实例、操作员等）
        if (fixText.length <= 0) {
            fixText = "0 " + originText;
        }

        // 将fix框中的内容放入结果框
        var showTex = $(".show_fixed").val();
        showTex += fixText + "\n";
        $(".show_fixed").val(showTex);

        // 删除原数组第一个元素
        origin_array.shift();

        //改变进度条
        changeProgress(originLength - origin_array.length, originLength)
        // 判断是否还有
        if (origin_array.length > 0) {
            var firstText = origin_array[0];
            firstText = textHighlight(firstText, keywords);
            $("#origin-text").html(firstText);

        } else {
            //询问框
            layer.confirm('换下一个吧hxd？', {
                btn: ['好的', '再改改'] //按钮
            }, function () {
                var fixed_text = $(".show_fixed").val();
                var blob = new Blob([fixed_text], {
                    type: "text/plain;charset=utf-8"
                });
                var newFileName = getFileName(fileName) + '_new' + getExtension(fileName)
                saveAs(blob, newFileName);
                location.reload();
            }, function () {
            });
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
        cleanEmpty(origin_array)
        originLength = origin_array.length
        changeProgress(0, originLength)

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

    //文字中符合关键词的高亮
    function textHighlight(text, keywords) {
        var len = keywords.length
        for (var i = 0; i < len; i++) {
            var keyword = keywords[i]
            var match = text.match(keyword)
            //匹配多处的情况
            if (match instanceof Array) {
                var matchLen = match.length
                for (var j = 0; j < matchLen; j++) {
                    var elem = match[j]
                    text = text.replace(elem, "<span style='color: #1E9FFF'>" + elem + "</span>")
                }
            } else {
                text = text.replace(match, "<span style='color: #1E9FFF'>" + match + "</span>")
            }

        }
        return text;
    }

    //打开提示文件
    $('#header-help').click(function () {
        layer.open({
            type: 2,
            title: '军事装备数据标识要点',
            shadeClose: true,
            shade: 0.8,
            area: ['90%', '65%'],
            content: 'help.html'
        });
    })

    // 获取文件名
    function getFileName(name) {
        return name.substring(0, name.lastIndexOf("."))
    }

    // 获取 .后缀名
    function getExtension(name) {
        return name.substring(name.lastIndexOf("."))
    }

    //修改进度条
    function changeProgress(current, length) {
        current = parseFloat(current)
        length = parseFloat(length)
        var percent = ((current / length) * 100).toFixed(1)
        element.progress('mark-progress', percent + '%');
        $('#progress-percent').text(percent)
        $('#progress-length').text(length)
    }
});


//清空数组中的空数组元素如[[],{a:1}]
function cleanEmpty(array) {
    for (var i = 0; i < array.length; i++) {
        if ((array[i] instanceof Array || typeof (array[i]) == 'string') && array[i].length === 0) {
            array.splice(i, 1);//返回指定的元素
            i--;
        }
    }
    return this;
}
