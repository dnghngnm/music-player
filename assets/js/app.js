const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0,
    playedSongsList: [],
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isCurrentIndex: 0,
    isProgress: 0,
    isProgressPercent: 0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: "See Tình",
            singer: "Hoàng Thùy Linh",
            path: "assets/music/song1.mp3",
            image: "assets/img/img1.jpg",
        },
        {
            name: "Kẻ Cắp Gặp Bà Già",
            singer: "Hoàng Thùy Linh",
            path: "assets/music/song2.mp3",
            image: "assets/img/img2.jpg",
        },
        {
            name: "Gieo Quẻ",
            singer: "Hoàng Thùy Linh",
            path: "assets/music/song3.mp3",
            image: "assets/img/img3.jpg",
        },
        {
            name: "Để Mị Nói Cho Mà Nghe",
            singer: "Hoàng Thùy Linh",
            path: "assets/music/song4.mp3",
            image: "assets/img/img4.jpg",
        },
        {
            name: "Duyên Âm",
            singer: "Hoàng Thùy Linh",
            path: "assets/music/song5.mp3",
            image: "assets/img/img5.jpg",
        },
        {
            name: "Bánh Trôi Nước",
            singer: "Hoàng Thùy Linh",
            path: "assets/music/song6.mp3",
            image: "assets/img/img6.jpg",
        },
        {
            name: "Kẽo Cà Kẽo Kẹt",
            singer: "Hoàng Thùy Linh",
            path: "assets/music/song7.mp3",
            image: "assets/img/img7.jpg",
        },
        {
            name: "Em Đây Chẳng Phải Thúy Kiều",
            singer: "Hoàng Thùy Linh",
            path: "assets/music/song8.mp3",
            image: "assets/img/img8.jpg",
        },
        {
            name: "Khi Tình Yêu Đủ Lớn",
            singer: "Hoàng Thùy Linh",
            path: "assets/music/song9.mp3",
            image: "assets/img/img9.jpg",
        },
        {
            name: "Lắm Mối Tối Ngồi Không",
            singer: "Hoàng Thùy Linh",
            path: "assets/music/song10.mp3",
            image: "assets/img/img10.jpg",
        },
    ],
    render: function () {
        const htmls = this.songs.map((song, i) => {
            return `
            <div class="song${i === this.currentIndex ? ' active' : ''}" data-index=${i}>
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h option__item"></i>
                </div>
            </div>
            `
        });
        playList.innerHTML = htmls.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10s
            iterations: Infinity,
        })
        cdThumbAnimate.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.screenY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const processPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = processPercent;
                progress.style.background = `linear-gradient(to right, var(--primary-color) ${progress.value}%, #d3d3d3 0%)`;
                _this.setConfig('isProgress', audio.currentTime);
                _this.setConfig('isProgressPercent', processPercent);
            }
        }

        // Xử lý khi tua song
        progress.oninput = function (e) {
            // 236s -> 100%
            // ?s -> 50%
            // const seekTime = audio.duration / 100 * e.target.value;
            audio.pause();
            const seekTime = (e.target.value * audio.duration) / 100;
            audio.currentTime = seekTime;
            progress.onchange = function () {
                audio.play();
            }
        }

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            // _this.render();
            _this.activeSong();
            _this.scrollToActiveSong();
        }

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            // _this.render();
            _this.activeSong();
            _this.scrollToActiveSong();
        }

        // Xử lý bật / tắt random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lý lặp lại một song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý next song khi audio end
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Lắng nghe hành vi click vào playList
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            const optionItem = e.target.closest('.option__item');
            // if (songNode || e.target.closest('.option')) {
            // Xử lý khi click vào song
            if (songNode && !optionItem) {
                _this.currentIndex = Number(songNode.getAttribute('data-index'));
                _this.loadCurrentSong();
                // _this.render();
                _this.activeSong();
                audio.play();
            }

            // Xử lý khi click vào song option
            if (e.target.closest('.option')) {
                alert(('Option not found!'));
            }
            // }
        }
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: this.currentIndex < 2 ? "end" : "center",
            }, 300);
        })
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

        // reset progress bar
        // progress.style.background = `linear-gradient(to right, var(--primary-color) 0%, #d3d3d3 0%)`;
        
        // lưu lại index bài hát hiện tại vào local Storage
        this.setConfig('isCurrentIndex', this.currentIndex);
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        this.currentIndex = this.config.isCurrentIndex;
        this.scrollToActiveSong();
        audio.currentTime = this.config.isProgress;
        progress.value = this.config.isProgressPercent;

        // Object.assign(this, this.config);
    },
    checkConfig: function() {
        this.config.isRepeat === true ? repeatBtn.classList.add('active', this.isRepeat) : repeatBtn.classList.remove('active', this.isRepeat);
        this.config.isRandom === true ? randomBtn.classList.add('active', this.isRandom) : randomBtn.classList.remove('active', this.isRandom);
        this.config.isCurrentIndex === undefined ? this.config.isCurrentIndex = 0 : '';
        this.config.isProgress === undefined ? this.config.isProgress = 0 : '';
        this.config.isProgressPercent === undefined ? this.config.isProgressPercent = 0 : '';
        
        // xử lý progress bar khi load lại trang web
        this.config.isProgress !== audio.currentTime ? progress.style.background = `linear-gradient(to right, var(--primary-color) ${this.config.isProgressPercent}%, #d3d3d3 0%)` : '';
    },
    activeSong: function () {
        if ($('.song.active')) {
            $('.song.active').classList.remove('active');
        }
        $$('.song')[this.currentIndex].classList.add('active');

        // tối ưu hóa progress bar khi sang bài hát khác
        progress.style.background = `linear-gradient(to right, var(--primary-color) ${progress.value = 0}, #d3d3d3 0%)`;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;

        // Thêm current index vào mảng playedSongsList mỗi khi có bài hát đc load
        this.playedSongsList.push(this.currentIndex);

        if (this.playedSongsList.length === this.songs.length) {
            this.playedSongsList = [];
        }

        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.playedSongsList.includes(newIndex));

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        
        // check config
        this.checkConfig();

        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM event)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();
        
        // Hiển thị trạng thái ban đầu của button repeat và random
        // randomBtn.classList.toggle('active', this.isRandom);
        // repeatBtn.classList.toggle('active', this.isRepeat);
    },
};

app.start();
