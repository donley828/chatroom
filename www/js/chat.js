window.onload = function () {
    var chat = new Chat();
    chat.init();
}

//定义Chat类
var Chat = function () {
    this.socket = null;
}

Chat.prototype = {
    init: function () { //初始化
        var that = this;
        //建立与服务器的socket的连接
        this.socket = io.connect();
        //发送按钮事件
        var sendBtn = document.getElementById('sendBtn');
        sendBtn.addEventListener('click', function () {
            var messageInput = document.getElementById('input-area'),
                msg = messageInput.value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg); //发送消息给服务器
                that._displayNewMsg('Me', msg); //自己窗口显示
            }
        }, false);
         //绑定键码

        //图片发送
        document.getElementById('imgBtn').addEventListener('change', function() {
            //检查是否有图片选中
            if (this.files.length != 0) {
                //获取文件使用filereader读取
                var file = this.files[0],
                    reader = new FileReader();
                if (!reader) {
                    that._displayNewMsg('system', 'Your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                }
                reader.onload = function(e) {
                    //读取成功
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    that._displayImage('me', e.target.result);
                }
                reader.readAsDataURL(file);
            }
        }, false);

        //监听connect事件
        this.socket.on('connect', function () {
            document.getElementById('info').style.display = 'none';
            document.getElementById('login').style.display = 'block';
            document.getElementById('nickstr').focus();
            document.getElementById('connBtn').addEventListener('click', function () {
                var nickName = document.getElementById('nickstr').value;
                if (nickName.trim().length != 0 && nickName.trim().length <=7 ) {
                    that.socket.emit('login', nickName);
                } else if (nickName.trim().length > 7) {
                    alert("Within 7 char");
                } else {
                    document.getElementById('nickstr').focus();
                }
            }, false);
        });
        this.socket.on('nickExisted', function () {
            alert('昵称已被占用');
        })
        this.socket.on('loginSuccess', function () {
            document.title = "Hello, " + document.getElementById('nickstr').value;
            document.getElementById('loginpanel').style.display = 'none';
            document.getElementById('input-area').focus();
        });
        this.socket.on('system', function (nickName, userCount, type) {
            //判断用户是离开还是登录
            var msg = nickName + (type == 'login' ? ' Joined' : ' Left');
            if (msg === "null Left")
                return false;
            that._displayNewMsg('System', msg, '#B43127');
            // var p = document.createElement('p');
            // p.textContent = msg;
            // document.getElementById('msg').appendChild(p);
            //显示在线人数
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });
        this.socket.on('newMsg', function (user, msg) {
            that._displayNewMsg(user, msg);
        });
        //接收显示图片
        this.socket.on('newImg', function(user, img) {
            that._displayImage(user, img);
        });

    },
    _displayNewMsg: function (user, msg, color) {
        var container = document.getElementById('msg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function (user, imgData, color) {
        var container = document.getElementById('msg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span><br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
}
