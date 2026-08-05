import { query, queryOne } from "./index"


// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface DbUser {
  id: string
  email: string
  password_hash: string
  created_at: string
}

export interface DbProfile {
  id: string
  user_type: "apartment" | "ngo" | "admin"
  name: string
  contact_person: string
  email: string
  phone: string | null
  address: string
  city: string
  state: string
  pincode: string
  created_at: string
  updated_at: string
}

export interface DbApartmentDetails {
  id: string
  profile_id: string
  apartment_name: string
  total_units: number | null
  society_registration_number: string | null
  created_at: string
}

export interface DbNgoDetails {
  id: string
  profile_id: string
  ngo_name: string
  registration_number: string
  head_office_address: string
  website: string | null
  focus_areas: string[] | null
  created_at: string
}

export interface DbListing {
  id: string
  apartment_id: string
  title: string
  description: string | null
  clothing_type: string
  quantity: number
  condition: string
  size_range: string | null
  available: boolean
  pickup_instructions: string | null
  created_at: string
  updated_at: string
}

export interface DbRequest {
  id: string
  ngo_id: string
  listing_id: string
  message: string | null
  status: string
  requested_quantity: number
  created_at: string
  updated_at: string
}

export interface DbMessage {
  id: string
  request_id: string
  sender_id: string
  message: string
  created_at: string
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  return queryOne<DbUser>("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase(),
  ])
}

export async function getUserById(id: string): Promise<DbUser | null> {
  return queryOne<DbUser>("SELECT * FROM users WHERE id = $1", [id])
}

export async function createUser(
  email: string,
  passwordHash: string
): Promise<DbUser> {
  const rows = await query<DbUser>(
    "INSERT INTO users (id, email, password_hash) VALUES (gen_random_uuid(), $1, $2) RETURNING *",
    [email.toLowerCase(), passwordHash]
  )
  return rows[0]
}

export async function updateUserPassword(
  userId: string,
  newPasswordHash: string
): Promise<void> {
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
    newPasswordHash,
    userId,
  ])
}

// ─────────────────────────────────────────────
// PROFILES
// ─────────────────────────────────────────────

export async function getProfileById(
  id: string
): Promise<DbProfile | null> {
  return queryOne<DbProfile>("SELECT * FROM profiles WHERE id = $1", [id])
}

export async function createProfile(data: {
  id: string
  user_type: string
  name: string
  contact_person: string
  email: string
  phone?: string
  address: string
  city: string
  state: string
  pincode: string
}): Promise<DbProfile> {
  const rows = await query<DbProfile>(
    `INSERT INTO profiles (id, user_type, name, contact_person, email, phone, address, city, state, pincode)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (id) DO UPDATE SET
       user_type = EXCLUDED.user_type,
       name = EXCLUDED.name,
       contact_person = EXCLUDED.contact_person,
       email = EXCLUDED.email,
       phone = EXCLUDED.phone,
       address = EXCLUDED.address,
       city = EXCLUDED.city,
       state = EXCLUDED.state,
       pincode = EXCLUDED.pincode,
       updated_at = NOW()
     RETURNING *`,
    [
      data.id,
      data.user_type,
      data.name,
      data.contact_person,
      data.email,
      data.phone ?? null,
      data.address,
      data.city,
      data.state,
      data.pincode,
    ]
  )
  return rows[0]
}

export async function updateProfile(
  id: string,
  data: Partial<Omit<DbProfile, "id" | "created_at" | "updated_at">>
): Promise<DbProfile | null> {
  const fields = Object.keys(data)
  if (fields.length === 0) return getProfileById(id)

  const setClauses = fields
    .map((f, i) => `${f} = $${i + 2}`)
    .join(", ")
  const values = fields.map((f) => (data as Record<string, unknown>)[f])

  const rows = await query<DbProfile>(
    `UPDATE profiles SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0] ?? null
}

export async function getFullProfile(id: string) {
  const rows = await query(
    `SELECT p.*,
       row_to_json(ad.*) AS apartment_details,
       row_to_json(nd.*) AS ngo_details
     FROM profiles p
     LEFT JOIN apartment_details ad ON ad.profile_id = p.id
     LEFT JOIN ngo_details nd ON nd.profile_id = p.id
     WHERE p.id = $1`,
    [id]
  )
  return rows[0] ?? null
}

// ─────────────────────────────────────────────
// APARTMENT DETAILS
// ─────────────────────────────────────────────

export async function upsertApartmentDetails(data: {
  profile_id: string
  apartment_name: string
  total_units?: number | null
  society_registration_number?: string | null
}): Promise<void> {
  await query(
    `INSERT INTO apartment_details (id, profile_id, apartment_name, total_units, society_registration_number)
     VALUES (gen_random_uuid(), $1, $2, $3, $4)
     ON CONFLICT (profile_id) DO UPDATE SET
       apartment_name = EXCLUDED.apartment_name,
       total_units = EXCLUDED.total_units,
       society_registration_number = EXCLUDED.society_registration_number`,
    [
      data.profile_id,
      data.apartment_name,
      data.total_units ?? null,
      data.society_registration_number ?? null,
    ]
  )
}

// ─────────────────────────────────────────────
// NGO DETAILS
// ─────────────────────────────────────────────

export async function upsertNgoDetails(data: {
  profile_id: string
  ngo_name: string
  registration_number: string
  head_office_address: string
  website?: string | null
  focus_areas?: string[] | null
}): Promise<void> {
  await query(
    `INSERT INTO ngo_details (id, profile_id, ngo_name, registration_number, head_office_address, website, focus_areas)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
     ON CONFLICT (profile_id) DO UPDATE SET
       ngo_name = EXCLUDED.ngo_name,
       registration_number = EXCLUDED.registration_number,
       head_office_address = EXCLUDED.head_office_address,
       website = EXCLUDED.website,
       focus_areas = EXCLUDED.focus_areas`,
    [
      data.profile_id,
      data.ngo_name,
      data.registration_number,
      data.head_office_address,
      data.website ?? null,
      data.focus_areas ?? null,
    ]
  )
}

// ─────────────────────────────────────────────
// LISTINGS
// ─────────────────────────────────────────────

export async function getListings(filters: {
  search?: string | null
  type?: string | null
  city?: string | null
  available?: boolean | null
}) {
  const conditions: string[] = []
  const values: unknown[] = []
  let idx = 1

  const availableVal = filters.available !== null ? filters.available : true
  conditions.push(`cl.available = $${idx++}`)
  values.push(availableVal)

  if (filters.search) {
    conditions.push(
      `(cl.title ILIKE $${idx} OR cl.description ILIKE $${idx})`
    )
    values.push(`%${filters.search}%`)
    idx++
  }

  if (filters.type && filters.type !== "all") {
    conditions.push(`cl.clothing_type = $${idx++}`)
    values.push(filters.type)
  }

  if (filters.city) {
    conditions.push(`p.city = $${idx++}`)
    values.push(filters.city)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  return query(
    `SELECT cl.*,
       json_build_object('name', p.name, 'city', p.city, 'state', p.state, 'contact_person', p.contact_person, 'phone', p.phone) AS profiles
     FROM clothing_listings cl
     JOIN profiles p ON p.id = cl.apartment_id
     ${where}
     ORDER BY cl.created_at DESC`,
    values
  )
}

export async function getListingById(id: string) {
  return queryOne(
    `SELECT cl.*,
       json_build_object('name', p.name, 'city', p.city, 'state', p.state, 'contact_person', p.contact_person, 'phone', p.phone) AS profiles
     FROM clothing_listings cl
     JOIN profiles p ON p.id = cl.apartment_id
     WHERE cl.id = $1`,
    [id]
  )
}

export async function createListing(data: {
  apartment_id: string
  title: string
  description?: string | null
  clothing_type: string
  quantity: number
  condition: string
  size_range?: string | null
  pickup_instructions?: string | null
}): Promise<DbListing> {
  const rows = await query<DbListing>(
    `INSERT INTO clothing_listings
       (id, apartment_id, title, description, clothing_type, quantity, condition, size_range, pickup_instructions, available)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, TRUE)
     RETURNING *`,
    [
      data.apartment_id,
      data.title,
      data.description ?? null,
      data.clothing_type,
      data.quantity,
      data.condition,
      data.size_range ?? null,
      data.pickup_instructions ?? null,
    ]
  )
  return rows[0]
}

export async function updateListing(
  id: string,
  data: Record<string, unknown>
): Promise<DbListing | null> {
  const fields = Object.keys(data)
  if (fields.length === 0) return null
  const setClauses = fields.map((f, i) => `${f} = $${i + 2}`).join(", ")
  const values = fields.map((f) => data[f])
  const rows = await query<DbListing>(
    `UPDATE clothing_listings SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0] ?? null
}

// ─────────────────────────────────────────────
// REQUESTS
// ─────────────────────────────────────────────

export async function getRequests(filters: {
  status?: string | null
  ngo_id?: string | null
  apartment_id?: string | null
}) {
  const conditions: string[] = []
  const values: unknown[] = []
  let idx = 1

  if (filters.status) {
    conditions.push(`cr.status = $${idx++}`)
    values.push(filters.status)
  }

  if (filters.ngo_id) {
    conditions.push(`cr.ngo_id = $${idx++}`)
    values.push(filters.ngo_id)
  }

  if (filters.apartment_id) {
    conditions.push(`cl.apartment_id = $${idx++}`)
    values.push(filters.apartment_id)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  return query(
    `SELECT cr.*,
       json_build_object('title', cl.title, 'apartment_id', cl.apartment_id) AS clothing_listings,
       json_build_object('name', np.name, 'contact_person', np.contact_person) AS ngo_profiles,
       json_build_object('name', ap.name, 'contact_person', ap.contact_person) AS apartment_profiles
     FROM clothing_requests cr
     JOIN clothing_listings cl ON cl.id = cr.listing_id
     JOIN profiles np ON np.id = cr.ngo_id
     JOIN profiles ap ON ap.id = cl.apartment_id
     ${where}
     ORDER BY cr.created_at DESC`,
    values
  )
}

export async function getRequestById(id: string) {
  return queryOne(
    `SELECT cr.*,
       json_build_object(
         'title', cl.title, 'description', cl.description, 'clothing_type', cl.clothing_type,
         'quantity', cl.quantity, 'condition', cl.condition, 'size_range', cl.size_range,
         'apartment_id', cl.apartment_id
       ) AS clothing_listings,
       json_build_object('name', np.name, 'contact_person', np.contact_person, 'phone', np.phone, 'address', np.address, 'city', np.city, 'state', np.state) AS ngo_profiles,
       json_build_object('name', ap.name, 'contact_person', ap.contact_person, 'phone', ap.phone, 'address', ap.address, 'city', ap.city, 'state', ap.state) AS apartment_profiles,
       row_to_json(nd.*) AS ngo_details
     FROM clothing_requests cr
     JOIN clothing_listings cl ON cl.id = cr.listing_id
     JOIN profiles np ON np.id = cr.ngo_id
     JOIN profiles ap ON ap.id = cl.apartment_id
     LEFT JOIN ngo_details nd ON nd.profile_id = cr.ngo_id
     WHERE cr.id = $1`,
    [id]
  )
}

export async function createRequest(data: {
  ngo_id: string
  listing_id: string
  requested_quantity: number
  message?: string | null
}): Promise<DbRequest> {
  const rows = await query<DbRequest>(
    `INSERT INTO clothing_requests (id, ngo_id, listing_id, requested_quantity, message, status)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending')
     RETURNING *`,
    [data.ngo_id, data.listing_id, data.requested_quantity, data.message ?? null]
  )
  return rows[0]
}

export async function updateRequest(
  id: string,
  data: Record<string, unknown>
): Promise<DbRequest | null> {
  const fields = Object.keys(data)
  if (fields.length === 0) return null
  const setClauses = fields.map((f, i) => `${f} = $${i + 2}`).join(", ")
  const values = fields.map((f) => data[f])
  const rows = await query<DbRequest>(
    `UPDATE clothing_requests SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0] ?? null
}

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

export async function getMessages(requestId: string) {
  return query(
    `SELECT m.*,
       json_build_object('name', p.name, 'contact_person', p.contact_person, 'user_type', p.user_type) AS profiles
     FROM messages m
     JOIN profiles p ON p.id = m.sender_id
     WHERE m.request_id = $1
     ORDER BY m.created_at ASC`,
    [requestId]
  )
}

export async function createMessage(data: {
  request_id: string
  sender_id: string
  message: string
}) {
  const rows = await query(
    `INSERT INTO messages (id, request_id, sender_id, message)
     VALUES (gen_random_uuid(), $1, $2, $3)
     RETURNING *`,
    [data.request_id, data.sender_id, data.message]
  )
  // Return with profile join
  const msg = rows[0] as DbMessage
  const full = await queryOne(
    `SELECT m.*,
       json_build_object('name', p.name, 'contact_person', p.contact_person, 'user_type', p.user_type) AS profiles
     FROM messages m
     JOIN profiles p ON p.id = m.sender_id
     WHERE m.id = $1`,
    [msg.id]
  )
  return full
}

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────

export async function getStats() {
  const results = await Promise.all([
    queryOne<{ count: string }>(
      "SELECT COUNT(*) AS count FROM profiles WHERE user_type = 'apartment'"
    ),
    queryOne<{ count: string }>(
      "SELECT COUNT(*) AS count FROM profiles WHERE user_type = 'ngo'"
    ),
    queryOne<{ count: string }>("SELECT COUNT(*) AS count FROM clothing_listings"),
    queryOne<{ count: string }>(
      "SELECT COUNT(*) AS count FROM clothing_listings WHERE available = TRUE"
    ),
    queryOne<{ count: string }>("SELECT COUNT(*) AS count FROM clothing_requests"),
    queryOne<{ count: string }>(
      "SELECT COUNT(*) AS count FROM clothing_requests WHERE status = 'pending'"
    ),
    queryOne<{ count: string }>(
      "SELECT COUNT(*) AS count FROM clothing_requests WHERE status = 'approved'"
    ),
    queryOne<{ count: string }>(
      "SELECT COUNT(*) AS count FROM clothing_requests WHERE status = 'completed'"
    ),
    queryOne<{ count: string }>("SELECT COUNT(*) AS count FROM messages"),
  ])

  const [
    apartments,
    ngos,
    total,
    active,
    requests,
    pending,
    approved,
    completed,
    messages,
  ] = results

  return {
    totalApartments: parseInt(apartments?.count ?? "0"),
    totalNGOs: parseInt(ngos?.count ?? "0"),
    totalListings: parseInt(total?.count ?? "0"),
    activeListings: parseInt(active?.count ?? "0"),
    totalRequests: parseInt(requests?.count ?? "0"),
    pendingRequests: parseInt(pending?.count ?? "0"),
    approvedRequests: parseInt(approved?.count ?? "0"),
    completedRequests: parseInt(completed?.count ?? "0"),
    totalMessages: parseInt(messages?.count ?? "0"),
  }
}
