class _PromiseLock {
    _lockId = 0;

    resetLock() {
        this._lockId++;
    }

    getLock() {
        return this._lockId;
    }

    checkLock(id:number) {
        return this._lockId == id;
    }

    async exe(p:Promise<any>) {
        let id = this.getLock();
        await p;
        let ok = this.checkLock(id);
        if(!ok) {
            cc.log("#PromiseLock:need break");
        }
        return ok;
    }
}

export let PromiseLock = new _PromiseLock();