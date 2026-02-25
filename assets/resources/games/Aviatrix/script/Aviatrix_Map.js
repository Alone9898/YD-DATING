
cc.Class({
    extends: cc.Component,

    properties: {
        atlasClouds: cc.SpriteAtlas,
        atlasSpace: cc.SpriteAtlas,
    },

    onLoad () {
        let node = this.node
        //飞机
        this._plane = node.getChildByName("plane")
        this._plane_pos = this._plane.getPosition()
        //爆炸
        this._explosion = node.getChildByName("explosion")
        this._explosion.opacity = 0
        //天空
        this._sky = node.getChildByName("sky")
        this._sky_pos = this._sky.getPosition()
        //晚霞
        this._clouds_horz = node.getChildByName("clouds_horizontal")
        this._clouds_horz_pos = this._clouds_horz.getPosition()
        //后景
        this._back_mts = node.getChildByName("back_mountains")
        this._back_mts_pos = this._back_mts.getPosition()
        //中景
        this._middle_mts = node.getChildByName("middle_mountains")
        this._middle_mts_pos = this._middle_mts.getPosition()
        //跑道
        this._ground = node.getChildByName("ground")
        this._ground_pos = this._ground.getPosition()
        //前景
        this._front = node.getChildByName("front")
        this._front_pos = this._front.getPosition()
        //云
        this._clouds = cc.find("sky/clouds", this.node)
        this._clouds_pos = this._clouds.getPosition()
        //阴影
        this._shadow = node.getChildByName("shadow")
        this._shadow_pos = this._shadow.getPosition()

        //星球图片
        this._planet_frame_names = ['hole', 'meteor', 'moon', 'planet', 'planet_2', 'planet_3', 'planet_dark', 'red_planet', 'small_planet']

        this._lbl_mult = node.getChildByName("lbl_mult").getComponent(cc.Label)

        this._running = false
        this._t = 0
        this._vx = 450      //x方向速度  
        this._vy = 300      //y方向速度
    },

    start() {
        this.createPlants() //创建太空
    },

    reset() {
        this._sky.setPosition(this._sky_pos)
        this._clouds_horz.setPosition(this._clouds_horz_pos)
        this._back_mts.setPosition(this._back_mts_pos)
        this._middle_mts.setPosition(this._middle_mts_pos)
        this._ground.setPosition(this._ground_pos)
        this._front.setPosition(this._front_pos)
        this._clouds.setPosition(this._clouds_pos)
        this._plane.setPosition(this._plane_pos)
        this._plane.angle = 0
        this._plane.opacity = 255
        this._explosion.opacity = 0
        this._shadow.setPosition(this._shadow_pos)
        this._shadow.setScale(1)
        this._lbl_mult.string = ""
        this._lbl_mult.node.color = cc.Color(255,255,255)
        this._t = 0
    },

    stop(mult) {
        this._running = false
        this.explosion()
        if (mult) {
            this._lbl_mult.string = Number(mult).toFixed(2)+"x"
        }
        this._lbl_mult.node.color = cc.Color(249,103,50)
    },

    run(t=0){
        this._t = t
        this._running = true
    },

    getElapseTime() {
        return this._t
    },

    getCurMult() {
        let dt = this._t
        let quant = cc.vv.gameData.getQuantParam()
        return quant.a*dt*dt + quant.b*dt + quant.c
    },

    updatePlane(dt) {
        let rot = 0
        if (dt > 1) {
            rot = Math.min(5, (dt-1)/2*5)
            this._plane.angle = rot

            let dy = Math.min((dt-1)*50, cc.winSize.height/4 - this._plane_pos.y)
            this._plane.y = this._plane_pos.y + dy
            
            dy = Math.min((dt-1) * 200, 4000)
            let ds = Math.min((dt-1) * 0.15, 0.5)
            this._shadow.y = this._shadow_pos.y - dy
            this._shadow.setScale(1-ds)
        }
    },

    explosion() {
        this._explosion.position = this._plane.position
        this._explosion.opacity = 255
        this._explosion.getComponent(cc.Animation).play("explosion")
        this._plane.runAction(cc.fadeOut(0.25))
    },

    updateSky(dt){
        let dx = Math.min(dt * 80, 2400)
        let dy = Math.min(dt * 160, 4800)
        this._sky.setPosition(this._sky_pos.x - dx, this._sky_pos.y - dy)
    },

    updatePosition(node, dt, initPos, speedRate) {
        let y_delay_time = 1 //y方向起飞延迟时间
        let y_accel_time = 2 //y方向加速时间
        let ay = this._vy / y_accel_time //y方向加速度

        let dx = this._vx * speedRate * dt
        let dy = 0
        if (dt > y_delay_time) {
            let t1 = Math.min(dt-y_delay_time, y_accel_time)
            let t2 = Math.max(0, dt-y_delay_time-y_accel_time)
            dy = 0.5 * ay * t1 * t1 + this._vy * t2
        }
        dx = Math.min(dx, 4000)
        dy = Math.min(dy, 4000)
        node.setPosition(initPos.x - dx, initPos.y - dy)
    },


    updateGround(dt){
        this.updatePosition(this._clouds_horz, dt, this._clouds_horz_pos, 0.3)
        this.updatePosition(this._back_mts, dt, this._back_mts_pos, 0.7)
        this.updatePosition(this._middle_mts, dt, this._middle_mts_pos, 0.85)
        this.updatePosition(this._ground, dt, this._ground_pos, 1)
        this.updatePosition(this._front, dt, this._front_pos, 1.2)
    },

    updateClouds(dt) {
        let delay_time = 3
        if (dt > delay_time) {   //延迟7秒
            let dx = Math.min((dt-delay_time) * 400, 10000)
            let dy = Math.min((dt-delay_time) * 250, 10000)
            this._clouds.setPosition(this._clouds_pos.x - dx, this._clouds_pos.y - dy)
        }
    },

    updatePlanets(dt) {
        let speed = cc.v2(240, 320)
        for (let star of this._stars) {
            let dx = speed.x * dt * star._speedRate
            let dy = speed.y * dt * star._speedRate
            let p = star.getPosition()
            p.x = p.x - dx
            p.y = p.y - dy
            if (p.y > -1800) {
                star.setPosition(p)
            } else {
                star.setPosition(Global.random(1200, 3600), Global.random(1600, 4800))
                star._speedRate = Math.random()*0.2 + 0.9
            }
        }
        for (let planet of this._planets) {
            let dx = speed.x * dt * planet._speedRate.x
            let dy = speed.y * dt * planet._speedRate.y
            let p = planet.getPosition()
            p.x = p.x - dx
            p.y = p.y - dy
            if (p.y > -1800) {
                planet.setPosition(p)
            } else {
                planet.setPosition(Global.random(1000, 3800), Global.random(1400, 5000))
                planet._speedRate = cc.v2(Math.random()*0.2 + 0.7, Math.random()*0.2 + 0.6)
                let framename = this._planet_frame_names[0, Global.random(0, this._planet_frame_names.length-1)]
                planet.getComponent(cc.Sprite).spriteFrame = this.atlasSpace.getSpriteFrame(framename)
            }
        }
    },

    updateMult(dt){
        let mult = this.getCurMult()
        this._lbl_mult.string = Number(mult).toFixed(2)+"x"
    },

    update (dt) {
        if (this._running) {
            this._t += dt
            this.updatePlane(this._t)
            this.updateSky(this._t)
            this.updateGround(this._t)
            this.updateClouds(this._t)
            this.updatePlanets(dt)
            this.updateMult(this._t)
        }
    },

    createPlants(){
        //创建20个星星
        let planetsNode = cc.find("sky/planets", this.node)
        this._stars = []
        for (let i=0; i<40; i++) {
            let star = new cc.Node()
            star.addComponent(cc.Sprite).spriteFrame = this.atlasSpace.getSpriteFrame("star")
            planetsNode.addChild(star)
            star.setPosition(Global.random(1200, 3600), Global.random(1600, 4800))
            star._speedRate = Math.random()*0.2 + 0.9
            this._stars.push(star)
        }
        //创建5个星球
        this._planets = []
        for (let i=0; i<10; i++) {
            let planet = new cc.Node()
            let framename = this._planet_frame_names[0, Global.random(0, this._planet_frame_names.length-1)]
            planet.addComponent(cc.Sprite).spriteFrame = this.atlasSpace.getSpriteFrame(framename)
            planetsNode.addChild(planet)
            planet.setPosition(Global.random(1000, 3800), Global.random(1400, 5000))
            planet._speedRate = cc.v2(Math.random()*0.2 + 0.7, Math.random()*0.2 + 0.6)
            this._planets.push(planet)
        }
    }
});
