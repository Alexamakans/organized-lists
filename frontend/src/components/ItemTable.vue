<script setup lang="ts">
defineProps<{
  headers: string[]
  columnWidths: number[]
  data: []
}>()
</script>

<template>
  <table class="item-table">
    <colgroup class="item-table-colgroup">
      <col
        v-for="(_, i) in headers"
        :key="`colgroup${i}`"
        :style="columnWidths.length === headers.length ? 'width: ' + columnWidths[i] + '%;' : ''"
        class="item-table-col"
      />
    </colgroup>
    <thead class="item-table-thead">
      <tr class="item-table-tr">
        <th v-for="(header, i) in headers" :key="`${header}${i}`" class="item-table-th">
          {{ header }}
        </th>
      </tr>
    </thead>
    <tbody class="item-table-tbody">
      <tr
        v-for="(entity, i) in data"
        :key="`entity-${entity.name}`"
        :class="`item-table-tr
item-table-tr-${i}`"
      >
        <td
          v-for="(header, j) in headers"
          :key="`${header}${j}`"
          :class="`item-table-td
item-table-td-${j}`"
        >
          <slot :name="`column${j}`" :entity="entity"></slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.item-table {
  width: 100%;
  height: 100%;

  border-collapse: separate;
  border: var(--border-style) var(--color-border) var(--border-thickness);
  border-radius: var(--border-radius);
}

td {
  padding: 0.25em;
}

.item-table-thead > .item-table-tr:nth-child(even),
.item-table-tbody > .item-table-tr:nth-child(odd) {
  background: var(--color-background-soft);
}

.item-table-thead > .item-table-tr:nth-child(odd),
.item-table-tbody > .item-table-tr:nth-child(even) {
  background: var(--color-background-mute);
}
</style>
