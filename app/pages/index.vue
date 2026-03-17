<template>
  <div>
    <v-row justify="center" class="mt-8">
      <v-col cols="12" md="8" lg="6">

        <!-- VIN Input Card -->
        <v-card>
          <v-card-title class="text-h5 d-flex align-center ga-2 pa-6">
            <v-icon color="primary">mdi-car-search</v-icon>
            VIN Decoder
          </v-card-title>

          <v-card-text class="pa-6 pt-0">
            <v-form ref="formRef" @submit.prevent="submitVin">
              <v-text-field
                v-model="vin"
                label="Vehicle Identification Number (VIN)"
                placeholder="e.g. 1HGBH41JXMN109186"
                :rules="vinRules"
                maxlength="17"
                counter
                variant="outlined"
                :disabled="loading"
                clearable
                prepend-inner-icon="mdi-barcode"
                @update:model-value="vin = vin.toUpperCase()"
              />
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="vin.length !== 17"
                class="mt-1"
                block
                size="large"
                prepend-icon="mdi-magnify"
              >
                Decode VIN
              </v-btn>
            </v-form>

            <!-- Error alert -->
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mt-4"
              closable
              @click:close="error = null"
            >
              {{ error }}
            </v-alert>

            <!-- Results -->
            <template v-if="result">
              <v-divider class="my-6" />

              <!-- Partial-decode warning -->
              <v-alert
                v-if="result.warning"
                type="warning"
                variant="tonal"
                class="mb-4"
                density="compact"
              >
                {{ result.warning }}
              </v-alert>

              <!-- Vehicle image -->
              <v-img
                v-if="result.imageUrl"
                :src="result.imageUrl"
                max-height="500"
                class="mb-6 rounded-lg bg-grey-lighten-4"
                cover
              >
                <template #error>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-icon size="80" color="grey-lighten-1">mdi-car-outline</v-icon>
                  </div>
                </template>
              </v-img>

              <!-- Details list -->
              <div class="text-subtitle-1 font-weight-medium mb-2">Vehicle Details</div>
              <v-list
                lines="two"
                rounded="lg"
                class="bg-grey-lighten-5"
              >
                <template v-for="(field, index) in result.fields" :key="field.label">
                  <v-list-item
                    :subtitle="field.label"
                    :title="field.value"
                  />
                  <v-divider v-if="index < result.fields.length - 1" inset />
                </template>
              </v-list>
            </template>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
interface VinResult {
  vin: string
  fields: { label: string; value: string }[]
  imageUrl: string | null
  warning: string | null
}

const formRef = ref()
const vin = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<VinResult | null>(null)

const vinRules = [
  (v: string) => v.length === 17 || 'VIN must be exactly 17 characters',
  (v: string) => /^[A-HJ-NPR-Z0-9]{17}$/.test(v) || 'VIN contains invalid characters (I, O, Q are not allowed)',
]

async function submitVin() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  error.value = null
  result.value = null

  try {
    result.value = await $fetch<VinResult>('/api/vin', {
      method: 'POST',
      body: { vin: vin.value },
    })
  } catch (err: any) {
    error.value = err?.data?.message ?? err?.message ?? 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}
</script>
