const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const audio = $('#audio')
const cd = $('.cd')
const cdRect = cd.getBoundingClientRect()    
const cdImg = cd.querySelector('.img-cd')
const listSongs = $('.list-songs')

const songActive = $('.song-avatar-clone.active')
const songAvatarClone = $('.song-avatar-clone')
const songsAvatarClone = $$('.song-avatar-clone')

const progressVolume = $('#progressVolume')
const progressTime = $('#progressTime')
const playBtn = $('.btn-toggle')

function timeFormat(ct) {
    minutes = Math.floor(ct / 60);
    seconds = Math.floor(ct % 60);

    minutesFormat = minutes < 10 ? "0" + minutes : minutes;
    secondsFormat = seconds < 10 ? "0" + seconds : seconds;

    return minutesFormat + ":" + secondsFormat;
};

const app = {
    currentIndex: 0,
    isPlaying: false,
    songs: [
        {
            name: 'Trốn tìm',
            singer: 'Đen Vâu - ft.MTV',
            path: './assets/music/tron-tim-den-ft.mtv.mp3',
            image: './assets/img/img-den-vau.jpg'
        },
        {
            name: 'Iceman',
            singer: 'Sol7 ft.MCK',
            path: './assets/music/iceman-sol7-ft.mck.mp3',
            image: './assets/img/img-iceman.jpg'
        },
        {
            name: 'BIGCITYBOI',
            singer: 'Touliver x Binz',
            path: './assets/music/bigcityboi-touliver-binz.mp3',
            image: './assets/img/img-bigcityboi.jpg'
        },
        // {
        //     name: 'Kill This Love',
        //     singer: 'Blackpink',
        //     path: './assets/music/kill-this-love-blackpink.mp3',
        //     image: './assets/img/img-kill-this-love.jpg'
        // },
        {
            name: 'Lạc trôi',
            singer: 'Sơn Tùng - MTP',
            path: './assets/music/lac-troi-sontungmtp.mp3',
            image: './assets/img/img-lac-troi.jpg'
        },
        {
            name: 'Đôi mắt',
            singer: 'G.Ducky',
            path: './assets/music/doi-mat-gducky.mp3',
            image: './assets/img/img-doi-mat.jpg'
        },
        {
            name: 'Va Vào Giai Điệu Này',
            singer: 'RPT MCK',
            path: './assets/music/va-vao-giai-dieu-nay-mck.mp3',
            image: './assets/img/img-va-vao-giai-dieu-nay.jpg'
        },
    ],
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song-item" data-index = ${index}>
                    <div class="song-avatar">
                        <img src="${song.image}" alt="">
                    </div>
                    <div class="song-avatar-clone avatar-${index}">
                        <img src="${song.image}" alt="">
                    </div>
                    <div class="song-name">
                        <h3>${song.name}</h3>
                        <span>${song.singer}</span>
                    </div>
                </div>
            `
        }).join('')
        
        listSongs.innerHTML = htmls
    },
    definePropertys: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this;

        const cdAnimate = cd.animate([
            {
                transform: 'rotate(360deg)'
            }
        ], {
            duration: 3500,
            iterations: Infinity
        })
        
        cdAnimate.pause()

        audio.onplay = function () {
            _this.isPlaying = true
            playBtn.firstElementChild.classList.remove('bx-play')
            playBtn.firstElementChild.classList.add('bx-pause')
            cdAnimate.play()
        }

        audio.onpause = function () {
            _this.isPlaying = false
            playBtn.firstElementChild.classList.remove('bx-pause')
            playBtn.firstElementChild.classList.add('bx-play')
            cdAnimate.pause()
        }

        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        listSongs.onclick = function (e) {
            const songItem = e.target.closest('.song-item')
            const index = songItem.dataset.index
            const avatarClone = songItem.querySelector(`.song-avatar-clone.avatar-${index}`)
    
            const top = avatarClone.getBoundingClientRect().top
            const left = avatarClone.getBoundingClientRect().left

            Promise.resolve(() => {
                audio.pause()
                cdAnimate.pause()
            })
                .then(() => {
                    return Promise.resolve(avatarClone.animate([
                            {
                                top: '0',
                                left: '0',
                                width: '50px',
                                height: '50px',
                            },
                            {
                                width: '300px',
                                height: '300px',
                                top: cdRect.top - top + 'px',
                                left: -(left - cdRect.left) + 'px',
                                zIndex: '-1',
                            },
                        ],{
                            duration: 1500,
                            iterations: 1,
                            easing: 'cubic-bezier(0.42, 0, 0.58, 1)'
                        })
                    )
                })
                .then((songAnimate) => {
                    const cdSrc = () => {
                        cd.firstElementChild.src = avatarClone.firstElementChild.src
                        return true
                    }
                    songAnimate.onfinish = () => {
                        if (cdSrc()) {
                            audio.src = _this.songs[index].path
                            cdAnimate.currentTime = 0
                            cdAnimate.play()
                            audio.play()
                        }
                    }
                })
        }

        progressTime.onchange = (event) => {
            const seekTime = Math.floor(audio.duration / 100 * event.target.value)
            audio.currentTime = seekTime
        }

        audio.ontimeupdate = () => {
            if (audio.duration) {
                progressTime.value = audio.currentTime / audio.duration * 100
            }
            $('#show-time').innerHTML = timeFormat(audio.currentTime);
        }

        audio.onloadeddata = () => {
            const calcVol = Math.floor(audio.volume * 100)
            progressVolume.value = calcVol
            $('#show-volume').innerHTML = calcVol + '%'
        }

        audio.onvolumechange = () => {
            $('#show-volume').innerHTML = audio.volume * 100 + '%'
        }

        progressVolume.onchange = (event) => {
            const seekVolume = 1 / 100 * event.target.value
            audio.volume = seekVolume
        }

        
    },
    loadCurrentSong: function () {
        cdImg.src = this.currentSong.image
        audio.src = this.currentSong.path
    },
    start: function () {
        this.definePropertys()

        this.handleEvents()

        this.loadCurrentSong()

        this.render()
    }
}

app.start()
