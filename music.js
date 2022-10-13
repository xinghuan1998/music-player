
        // 全局变量
        var mainAudio = $('#main_audio');//获取元素
        var isPlay = false;//声明一个标记，记录当前播放状态
        var isMouseDownOnPlayBar = false;//记录鼠标按下音乐播放按钮状态
        var isMouseDownOnVolumeBar = false;//记录鼠标按下音量按钮的状态
        var isVolumeBarShow = false;//记录当前音量进度条显示状态
        var musicList = [];//设置音乐列表
        var playIdxNow = -1;//设置当前正在播放音乐的id

        //进度条拖动函数
        class ProgressBar {
            constructor(bar, dot, direction) {
                this.bar = bar;
                this.dot = dot;
                this.direction = direction;
                if (direction == 'left') {
                    this.start = bar.offset().left;//计算进度条开始坐标x
                    this.end = this.start + bar.width() - 5;//结束x坐标
                }
                else {
                    this.start = bar.offset().top;//计算音量控制小圆点的开始坐标y
                    this.end = this.start + bar.height() - 5;//结束坐标y
                }


            }
            setPosByEvent(x) {//使用绝对坐标X设置进度
                if (x <= this.end && x >= this.start) {
                    this.dot.css(this.direction, x - this.start + 'px');//进度条当前进度（根据小圆点x坐标计算）
                }
            }
            setPosByPerc(p) {//使用百分比设置进度
                if (this.direction == 'left')
                    var x = p * this.bar.width();
                else
                    var x = p * this.bar.height();
                this.dot.css(this.direction, x + 'px');
            }
            getPosByPerc() {//使用百分比获取进度
                return +this.dot.css(this.direction).replace('px', '') / (this.end - this.start);//获取控制小圆点的属性，并用空字符代替px进行百分比计算
            }
        }

        var musicBar = new ProgressBar($('#pro-bar'), $('#pro-control'), 'left');
        var volumeBar = new ProgressBar($('#volume-bar'), $('#volume-control'), 'top');


        //事件函数 主页-详情页切换事件
        $('.pmusic-bar').click(function () {
            $('.music-detail').css('top', '0%')
        });
        $('#back').click(function () {
            $('.music-detail').css('top', '100%');
            $('.volume-control-panel').hide();
            isVolumeBarShow = false;
        });
        //控制音乐播放事件
        function PlayControl() {
            if (isPlay) {
                musicPause();
                $('.cover').removeClass('spinner');//移除图片旋转动画效果
            } else {
                musicPlay();
                $('.cover').addClass('spinner');
            }
        };
        $('.play-button').click(PlayControl);
        $(".forward-button").click(function () {//播放下一首音乐
            if (playIdxNow == musicList.length - 1) {//如果当前音乐的索引等于最后一首歌的索引
                loadMusic(0);//下一首歌则为第一首歌
            } else {
                loadMusic(playIdxNow + 1);//依次将索引加一
            }
        })
        $(".backward-button").click(function () {//播放上一首音乐
            if (playIdxNow == 0) {//如果当前音乐的索引等于第一首歌的索引
                loadMusic(musicList.length - 1);//上一首歌则为最后一首歌
            } else {
                loadMusic(playIdxNow - 1);//依次将索引减一
            }
        })
        $('.volume-button').click(function () {//音量进度条显示隐藏事件
            if (isVolumeBarShow) {
                $('.volume-control-panel').hide();//音量控制条隐藏
                isVolumeBarShow = false;
            } else {
                $('.volume-control-panel').show();//将音量进度条显示
                volumeBar = new ProgressBar($('#volume-bar'), $('#volume-control'), 'top');//调用进程函数设置音量的大小，控件跟随鼠标移动
                isVolumeBarShow = true;//更改隐藏状态
            }
        }).blur(function () {//鼠标失去焦点 音量控制隐藏
            $('.volume-control-panel').hide();
            isVolumeBarShow = false;
        });



        function isPC() {//是否为PC端
            var userAgentInfo = navigator.userAgent;
            var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
            }
            return flag;
        }
        if (isPC()) {
            //PC端添加Mouse事件
            $('#pro-control').on('mousedown', function () {//进度条控制圈按下事件
                isMouseDownOnPlayBar = true;
            });
            $('#volume-control').on('mousedown', function () {//进度条控制圈按下事件
                isMouseDownOnVolumeBar = true;//记录鼠标按下状态
                console.log('mousedown')
            });

            $(document).on('mousemove', function (event) {//鼠标移动函数，在鼠标按下状态改变进度条的控件位置属性
                if (isMouseDownOnPlayBar) {//如果鼠标按下，则执行绝对坐标定位函数，确定控件在进度条上距离起点的长度距离
                    musicBar.setPosByEvent(event.pageX);
                    var p = musicBar.getPosByPerc();//获取音乐进度条的百分比
                    musicJumpByPerc(p);//通过音乐进度条百分比设置音乐播放进度
                }
                if (isMouseDownOnVolumeBar) {
                    volumeBar.setPosByEvent(event.pageY);//如果鼠标按下，则执行绝对坐标定位函数，确定控件在音量条上距离起点的高度距离
                    var p = volumeBar.getPosByPerc();//获取音量控件在进度条的百分比
                    mainAudio[0].volume = 1 - p;//通过音量进度条百分比设置音量的大小
                }
            });

            $(document).on('mouseup', function () {
                isMouseDownOnPlayBar = false;
                isMouseDownOnVolumeBar = false;
            });

        } else {
            //移动端添加Touch事件
            $('#pro-control').on('touchstart', function () {//进度条控制圈按下事件
                isMouseDownOnPlayBar = true;
            });
            $('#volume-control').on('touchstart', function () {//进度条控制圈按下事件
                isMouseDownOnVolumeBar = true;
                console.log('mousedown')
            });

            $(document).on('touchmove', function (event) {
                if (isMouseDownOnPlayBar) {
                    musicBar.setPosByEvent(event.touches[0].pageX);
                    var p = musicBar.getPosByPerc();
                    musicJumpByPerc(p);
                }
                if (isMouseDownOnVolumeBar) {
                    volumeBar.setPosByEvent(event.touches[0].pageY);
                    var p = volumeBar.getPosByPerc();
                    mainAudio[0].volume = 1 - p;
                }
            });

            $(document).on('touchend', function () {
                isMouseDownOnPlayBar = false;
                isMouseDownOnVolumeBar = false;
            });
        }





        // 功能函数
        function musicPlay() {//音乐播放
            mainAudio[0].play();
            isPlay = true;
            $('.play-button i').removeClass('fa-play').addClass('fa-pause');
        }

        function musicPause() {//音乐暂停
            mainAudio[0].pause();
            isPlay = false;
            $('.play-button i').removeClass('fa-pause').addClass('fa-play');
        }
        function musicJumpByPerc(p) {//百分比定位控制音乐进度
            mainAudio[0].currentTime = mainAudio[0].duration * p;
        }
        /*
        setInterval(function () {//进度条自动移动
            musicBar.setPosByPerc(mainAudio[0].currentTime / mainAudio[0].duration)
        }, 100);*/

        function getMusicList() {//获取首页歌单列表
            $.ajax({
                url: 'http://218.199.4.140:5000/list_music',
                success: function (data) {
                    musicList = data.data;

                    for (var i = 0; i < musicList.length; i++) {
                        var actor = musicList[i].actor;
                        var title = musicList[i].title;
                        var id = musicList[i].id;
                        var html = '<div class="item" onclick="loadMusic(' + i + ')">\
        <div class="col" style = "width:50px;text-align: center;line-height:43px" >'+ (i + 1) + '</div>\
                <div class="col" style="width:calc(100% - 110px);">\
                    <div class="song">'+ title + '</div>\
                    <div class="act" style="font-size:80%">'+ actor + '</div>\
                </div>\
                <div class="col" style="width:50px;line-height:43px"><i class="fa fa-youtube-play fa-lg"></i></div>\
            </div></div>';
                        $('.music-list').append(html);
                    }
                }
            })
        }

        function loadMusic(i) {//加载指定音乐的index并且播放
            playIdxNow = i;
            $.ajax({
                url: 'http://218.199.4.140:5000/music_info?id=' + musicList[i].id,
                success: function (data) {
                    var cover = data.cover;
                    var u = data.abc;
                    var img = data.cover;
                    $('.cover').attr('src', img);
                    $('.title').text(data.title);
                    $('.actor').text(data.actor);
                    mainAudio.attr('src', u);
                    musicPlay();
                }
            })
        }

        //函数调用
        getMusicList();
        $(window).keypress(function (e) {
            if (e.keyCode != 32) return;
            console.log(e)
            PlayControl();

        });
