<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ItemTable from '@/components/ItemTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import { Icon } from '@iconify/vue'

async function getLists(searchRegex: [string]) {
  let url = 'http://192.168.0.107:60001/api/v1/list';
  if (searchRegex) {
    url = `${url}?name=${searchRegex}`;
  }
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  const lists = await res.json()
  if (lists.error) {
    console.error(res.status, listData.value.error)
    return []
  }

  for (const list of lists) {
    if (list.createdAt) {
      list.createdAt = new Date(list.createdAt)
    }
    if (list.modifiedAt) {
      list.modifiedAt = new Date(list.modifiedAt)
    }
  }

  return lists
}

async function deleteList(id: number) {
  const res = await fetch(`http://192.168.0.107:60001/api/v1/list/${id}`, {
    method: 'DELETE',
  })
  if (res.status !== 204) {
    console.error(res)
  }
  listData.value = await getLists()
}

function editList(id: number) {
  // TODO: this should probably be a redirect to a different page?
  // check VUE spa stuff?
}

const listHeaders = ['Name', 'Created', 'Modified', '']
const listColumnWidths = [65, 12.5, 12.5, 10];
const listData = ref([])
onMounted(async () => {
  listData.value = await getLists()
})

const search = ref('');

watch(search, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    listData.value = await getLists(newValue);
  }
});
</script>

<template>
  <div class="table-container">
    <SearchBar v-model="search" name="searchRegex"></SearchBar>
    <ItemTable :headers="listHeaders" :columnWidths="listColumnWidths" :data="listData">
      <template #column0="{ entity }">
        {{ entity.name }}
      </template>
      <template #column1="{ entity }">
        {{
          entity.createdAt.toLocaleString('en-gb', {
            month: 'short',
            year: 'numeric',
            day: 'numeric',
          })
        }}
      </template>
      <template #column2="{ entity }">
        {{
          entity.modifiedAt.toLocaleString('en-gb', {
            month: 'short',
            year: 'numeric',
            day: 'numeric',
          })
        }}
      </template>
      <template #column3="{ entity }">
        <div style="text-align: center;">
          <Icon
            @click="() => editList(entity.id)"
            icon="mdi:edit-circle-outline"
            class="iconify-gray"
          />
          <Icon
            @click="() => deleteList(entity.id)"
            icon="mdi:trash-can-circle-outline"
            style="color: var(--color-red)"
          />
        </div>
      </template>
    </ItemTable>
  </div>
</template>

<style scoped>
.table-container {
  width: 100%;
  height: 100%;
}

.iconify {
   font-size: 32px;
}

.iconify:hover {
  cursor: pointer;
  filter: brightness(0.8);
}
</style>
