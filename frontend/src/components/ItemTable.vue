<script setup lang="ts">
defineProps<{
  headers: string[]
  columnWidths: number[]
  data: []
}>()
</script>

<template>
  <table>
    <colgroup>
      <col
        v-for="(_, i) in headers"
        :key="`colgroup${i}`"
        :style="columnWidths.length === headers.length ? 'width: ' + columnWidths[i] + '%;' : ''" />
    </colgroup>
    <thead>
      <tr>
        <th v-for="(header, i) in headers" :key="`${header}${i}`" class="header-item">
          {{ header }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entity in data" :key="`entity-${entity.name}`" class="table-rows">
        <td v-for="(header, i) in headers" :key="`${header}${i}`">
          <slot :name="`column${i}`" :entity="entity"></slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  width: 100%;
  height: 100%;

  border-collapse: separate;
  border: var(--border-style) var(--color-border) var(--border-thickness);
  border-radius: var(--border-radius);
}

td {
  padding-left: 15px;
}

thead>tr:nth-child(even), tbody>tr:nth-child(odd) {
  background: var(--color-background-soft);
}

thead>tr:nth-child(odd), tbody>tr:nth-child(even) {
  background: var(--color-background-mute);
}
</style>
