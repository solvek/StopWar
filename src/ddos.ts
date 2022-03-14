export interface TargetDef {
    url: string
}

export interface Target {
    url: string
    requests: number
    errors: number
}

export class Ddos {
    targets = ref<Array<Target>>([])

    isEmpty() {
        return this.targets.value.length == 0
    }

    setTargets(rawTargets: Array<TargetDef>){
        this.targets.value = rawTargets.map((def) => {
            return {
                url: def.url,
                requests: 0,
                errors: 0
            }
        })
        console.log(this.targets)
    }

    // setRequests(requests: number){
    //     this.targets.value[0].requests = requests
    // }
    //
    // setErrors(errors: number){
    //     this.targets.value[0].errors = errors
    // }
}