<script setup lang="ts">

const router = useRouter()

const { t } = useI18n()

import Papa from 'papaparse'

import {Ddos} from '~/ddos'

const ddos = new Ddos()

const setTargets = (newTargets: Array<any>) => {
    ddos.setTargets(newTargets.slice(1).map((row) => {
        return {
            url: row[0],
            raw: row
        }
    }))
}

Papa.parse(
  "https://docs.google.com/spreadsheets/d/1rzIfGbkmdJaWcXThfzpX0ERIYKE5c6P1jfUSVCHNhFA/gviz/tq?tqx=out:csv&sheet=Targets",
  {
      download: true,
      complete: (result) => {
          setTargets(result.data)
      }
  })
</script>

<template>
  <div>
    <div text-4xl v-if="ddos.isEmpty()">
      <div i-carbon-in-progress inline-block />
    </div>
      <ul v-else>
          <li v-for="item in ddos.targets.value"  :key="item.url">
              {{ item.url }}, requests: {{item.requests}}, errors: {{item.errors}}
          </li>
      </ul>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
