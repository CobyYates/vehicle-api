export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const vin = body?.vin?.toString().trim().toUpperCase()

  if (!vin || !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid VIN. Must be 17 alphanumeric characters (I, O, and Q are not allowed).',
    })
  }

  const nhtsaRes = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`,
  )

  if (!nhtsaRes.ok) {
    throw createError({ statusCode: 502, message: 'NHTSA API is unavailable. Please try again.' })
  }

  const nhtsaData = await nhtsaRes.json() as any
  const vehicle = nhtsaData.Results?.[0]

  if (!vehicle) {
    throw createError({ statusCode: 404, message: 'No vehicle data found for this VIN.' })
  }

  // ErrorCode 8 = Invalid/undecodable VIN — surface as error. Other non-zero
  // codes (e.g. 6 = Incomplete, 1 = bad check digit) still return partial data.
  const errorCode: string = vehicle.ErrorCode ?? '0'
  if (errorCode.startsWith('8')) {
    throw createError({ statusCode: 422, message: vehicle.ErrorText || 'Could not decode this VIN.' })
  }

  // Non-fatal decode warnings (partial data) surfaced as a warning string.
  const warning: string | null = errorCode !== '0' ? (vehicle.ErrorText ?? null) : null

  const fieldDefs = [
    { label: 'Make', key: 'Make' },
    { label: 'Model', key: 'Model' },
    { label: 'Year', key: 'ModelYear' },
    { label: 'Trim', key: 'Trim' },
    { label: 'Vehicle Type', key: 'VehicleType' },
    { label: 'Body Class', key: 'BodyClass' },
    { label: 'Drive Type', key: 'DriveType' },
    { label: 'Engine (HP)', key: 'EngineHP' },
    { label: 'Engine Cylinders', key: 'EngineCylinders' },
    { label: 'Displacement (L)', key: 'DisplacementL' },
    { label: 'Fuel Type', key: 'FuelTypePrimary' },
    { label: 'Transmission Style', key: 'TransmissionStyle' },
    { label: 'Number of Doors', key: 'Doors' },
    { label: 'Number of Seats', key: 'Seats' },
    { label: 'Manufacturer', key: 'Manufacturer' },
    { label: 'Plant City', key: 'PlantCity' },
    { label: 'Plant Country', key: 'PlantCountry' },
  ]

  const fields = fieldDefs
    .map(({ label, key }) => ({ label, value: (vehicle[key] ?? '').trim() }))
    .filter(f => f.value !== '')

  // Build imagin.studio image URL using make + model + year.
  const { imaginCustomer: customer } = useRuntimeConfig(event)
  const make = (vehicle.Make ?? '').trim()
  const model = (vehicle.Model ?? '').trim()
  const year = vehicle.ModelYear ?? ''
  const trim = (vehicle.Trim ?? '').trim()

  let imageUrl: string | null = null
  if (make && model) {
    const params = new URLSearchParams({
      customer,
      make,
      modelFamily: model,
      zoomType: 'fullscreen',
      angle: '1',
    })
    if (year) params.set('modelYear', year)
    // if (trim) params.set('modelRange', trim)
    imageUrl = `https://cdn.imagin.studio/getimage?${params.toString()}`
  }

  return { vin, fields, imageUrl, warning }
})
