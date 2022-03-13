<script setup lang="ts">

const router = useRouter()

const { t } = useI18n()

import Papa from 'papaparse'

let targets = ref(null)

const setTargets = (newTargets) => {
    targets.value = newTargets.slice(1).map((row) => {
        return {
            url: row[0],
            raw: row
        }

    })
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
      <ul v-if="targets">
          <li v-for="item in targets">
              {{ item.url }}
          </li>
      </ul>
    <div text-4xl v-else>
      <div i-carbon-campsite inline-block />
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
