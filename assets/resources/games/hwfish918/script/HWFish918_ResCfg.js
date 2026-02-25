module.exports = {
    res_path : "games/hwfish918/",

    fishes : {
        [1]:{name:"绿叶小鱼", type:"fish", com:"", icon:"", file:"Fish001", form:"plist", anim:"Fish001", fcnt:35, sample:30, speed:10, box:{width:24,height:40,offsetx:4,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [2]:{name:"小丑鱼", type:"fish", com:"", icon:"", file:"Fish002", form:"plist", anim:"Fish002", fcnt:30, sample:30, speed:12, box:{width:32,height:26,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [3]:{name:"黄蓝纹鱼", type:"fish", com:"", icon:"", file:"Fish003", form:"plist", anim:"Fish003", fcnt:60, sample:30, speed:10, box:{width:56,height:32,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [4]:{name:"粉红刺鱼", type:"fish", com:"", icon:"", file:"Fish004", form:"plist", anim:"Fish004", fcnt:60, sample:30, speed:12, box:{width:48,height:40,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [5]:{name:"紫衫鱼", type:"fish", com:"", icon:"", file:"Fish005", form:"plist", anim:"Fish005", fcnt:29, sample:30, speed:10, box:{width:60,height:70,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [6]:{name:"黄鳊鱼", type:"fish", com:"", icon:"", file:"Fish006", form:"plist", anim:"Fish006", fcnt:36, sample:30, speed:10, box:{width:64,height:54,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [7]:{name:"小龙虾", type:"fish", com:"", icon:"", file:"Fish007", form:"plist", anim:"Fish007", fcnt:24, sample:30, speed:15, box:{width:66,height:52,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [8]:{name:"紫旗鱼", type:"fish", com:"", icon:"", file:"Fish008", form:"plist", anim:"Fish008", fcnt:19, sample:15, speed:8, box:{width:100,height:44,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [9]:{name:"八爪鱼", type:"fish", com:"", icon:"", file:"Fish009", form:"plist", anim:"Fish009", fcnt:56, sample:15, speed:18, box:{width:80,height:60,offsetx:0,offsety:8},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [10]:{name:"灯笼鱼", type:"fish", com:"", icon:"", file:"Fish010", form:"plist", anim:"Fish010", fcnt:20, sample:15, speed:14, box:{width:80,height:60,offsetx:-4,offsety:0},
            hit_snd:"", scale:1.1, lockposes:[cc.v2(0,0)]},

        [11]:{name:"海龟", type:"fish", com:"", icon:"", file:"Fish011", form:"plist", anim:"Fish011", fcnt:31, sample:15, speed:18, box:{width:96,height:64,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [12]:{name:"锯齿鲨", type:"fish", com:"", icon:"SD_12", file:"Fish012", form:"plist", anim:"Fish012", fcnt:17, sample:15, speed:12, box:{width:160,height:48,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [13]:{name:"蓝魔鬼鱼", type:"fish", com:"", icon:"SD_13", file:"Fish013", form:"plist", anim:"Fish013", fcnt:24, sample:15, speed:13, box:{width:90,height:100,offsetx:40,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [14]:{name:"精英小丑鱼", type:"fish", com:"", icon:"SD_14", file:"Fish014", form:"plist", anim:"Fish014", fcnt:30, sample:30, speed:12, box:{width:190,height:90,offsetx:10,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [15]:{name:"精英黄蓝纹鱼", type:"fish", com:"", icon:"SD_15", file:"Fish015", form:"plist", anim:"Fish015", fcnt:60, sample:30, speed:10, box:{width:176,height:80,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [16]:{name:"精英粉红刺鱼", type:"fish", com:"", icon:"SD_16", file:"Fish016", form:"plist", anim:"Fish016", fcnt:60, sample:30, speed:12, box:{width:128,height:100,offsetx:20,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [17]:{name:"鲨鱼", type:"fish", com:"", icon:"SD_17", file:"Fish017", form:"plist", anim:"Fish017", fcnt:30, sample:30, speed:15, box:{width:172,height:72,offsetx:16,offsety:0},
            hit_snd:"", scale:1.1, lockposes:[cc.v2(0,0)]},

        [18]:{name:"杀人鲸", type:"fish", com:"", icon:"SD_18", file:"Fish018", form:"plist", anim:"Fish018", fcnt:30, sample:15, speed:17, box:{width:234,height:128,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [19]:{name:"帝王鲸", type:"fish", com:"", icon:"SD_19", file:"Fish019", form:"plist", anim:"Fish019", fcnt:19, sample:15, speed:18, box:{width:320,height:128,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(114,8), cc.v2(-128,8), cc.v2(20,64), cc.v2(20,-64)]},

        [20]:{name:"狂暴火龙", type:"boss", com:"", icon:"SD_20", file:"", form:"", anim:"", fcnt:0, sample:0, speed:9.5, box:{width:1000,height:300,offsetx:60,offsety:20},
            hit_snd:"hw_f_hit_dragon", lockposes:[cc.v2(-400,0), cc.v2(0,0), cc.v2(400,0)]},

        [21]:{name:"深海狂鳌", type:"boss", com:"", icon:"SD_21", file:"Fish021", form:"plist", anim:"Fish021", fcnt:20, sample:24, speed:15, box:{width:236,height:192,offsetx:0,offsety:20},
            hit_snd:"hw_f_hit_px", lockposes:[cc.v2(-60,-60), cc.v2(80,-60)]},

        [22]:{name:"暗夜魔兽", type:"boss", com:"", icon:"SD_22", file:"Fish022", form:"plist", anim:"Fish022", fcnt:33, sample:30, speed:18, box:{width:250,height:220,offsetx:10,offsety:0},
            hit_snd:"hw_f_hit_dly", scale:1.5, lockposes:[cc.v2(80,0), cc.v2(-90,0), cc.v2(0,90), cc.v2(0,-80)]},

        [23]:{name:"深海章鱼", type:"boss", com:"HWFish918_FishOctopus", icon:"SD_23", file:"Fish023", form:"plist", anim:"Fish023", fcnt:66, sample:30, speed:20, box:{width:0,height:0,offsetx:0,offsety:0},
            hit_snd:"hw_f_hit_zy", lockposes:[cc.v2(-53, -188), cc.v2(-100, 30), cc.v2(90, 127)]},

        [24]:{name:"史前巨鳄", type:"boss", com:"", icon:"SD_24", file:"Fish024/boss_crocodile", form:"spine", anim:"boss_crocodile", fcnt:0, sample:0, speed:18, box:{width:1000,height:280,offsetx:30,offsety:0},
            hit_snd:"hw_f_hit_ey", scale:0.5, lockposes:[cc.v2(400,0), cc.v2(-400,0), cc.v2(150,140), cc.v2(150,-140), cc.v2(-100,140), cc.v2(-100,-140)]},

        [25]:{name:"钻头炮蟹", type:"fish", com:"", icon:"SD_25", file:"Fish025", form:"plist", anim:"Fish025", fcnt:15, sample:30, speed:10, box:{width:96,height:72,offsetx:4,offsety:0},
            hit_snd:"", lockposes:[cc.v2(-16,-24), cc.v2(20,-24)]},

        [26]:{name:"电磁炮蟹", type:"fish", com:"", icon:"SD_26", file:"Fish026", form:"plist", anim:"Fish026", fcnt:15, sample:30, speed:10, box:{width:90,height:80,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(-14,-24), cc.v2(24,-24)]},

        [27]:{name:"炸弹蟹", type:"fish", com:"", icon:"SD_27", file:"Fish027", form:"plist", anim:"Fish027", fcnt:15, sample:30, speed:10, box:{width:80,height:80,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(-16,-30), cc.v2(20,-30)]},

        [28]:{name:"连锁闪电", type:"fish", com:"HWFish918_FishVessel", icon:"SD_28", file:"Fish028", form:"plist", anim:"Fish028", fcnt:4, sample:8, speed:12, box:{width:120,height:120,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [29]:{name:"旋风鱼", type:"fish", com:"HWFish918_FishVessel", icon:"SD_29", file:"Fish028", form:"plist", anim:"Fish029", fcnt:4, sample:8, speed:12, box:{width:100,height:100,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(0,0)]},

        [30]:{name:"海王", type:"boss", com:"", icon:"SD_30", file:"Fish030", form:"plist", anim:"Fish030", fcnt:8, sample:8, speed:15, box:{width:440,height:160,offsetx:0,offsety:0},
            hit_snd:"", lockposes:[cc.v2(128,50), cc.v2(128,-64), cc.v2(120,0), cc.v2(-120,0)]},
    },

    bullets: {
        [1]:{name:"渔网", sprite:"Bullet", fire_snd:"hw_fire_1", bomb_snd:"hw_b_bomb_1"},
        [2]:{name:"导弹", sprite:"MaxZD_07", fire_snd:"hw_fire_2", bomb_snd:"hw_b_bomb_2"},
        [3]:{name:"激光", sprite:"", fire_snd:"", bomb_snd:""},
        [4]:{name:"火球", sprite:"", fire_snd:"", bomb_snd:""},
    }
}
