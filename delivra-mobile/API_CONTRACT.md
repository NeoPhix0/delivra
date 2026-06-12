# API Contract - Delivra Mobile

**Date:** June 8, 2026

## Introduction

This document defines the API contract between the Delivra Mobile application (delivra-mobile) and the Delivra Backend API (delivra-api). It specifies all endpoints, request/response formats, and the screens that consume each service.

All endpoints are currently marked as "⏳ To implement" as the backend API is under development.

---

## authService

### POST /auth/login
- Request: `{ email: string, password: string }`
- Response: `{ token: string, user: { id: string, email: string, full_name: string, role: 'admin' | 'driver' | 'client' } }`
- Called by: AuthContext (used by login screen)

### POST /auth/register
- Request: `{ email: string, full_name?: string, role?: 'admin' | 'driver' | 'client' }`
- Response: `{ token: string, user: { id: string, email: string, full_name: string, role: 'admin' | 'driver' | 'client' } }`
- Called by: AuthContext (used by register screen)

### POST /auth/logout
- Request: `{}`
- Response: `{}`
- Called by: AuthContext

### GET /auth/me
- Request: `{}`
- Response: `{ id: string, email: string, full_name: string, role: 'admin' | 'driver' | 'client' } | null`
- Called by: AuthContext

### POST /auth/refresh
- Request: `{}`
- Response: `{ token: string }`
- Called by: AuthContext

### POST /auth/forgot-password
- Request: `{ email: string }`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### POST /auth/reset-password
- Request: `{ token: string, password: string }`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### POST /auth/verify-email
- Request: `{ token: string }`
- Response: `{ message: string }`
- Called by: Not currently used in screens

---

## deliveryService

### GET /client/deliveries
- Request: `{}`
- Response: `{ deliveries: [{ id: string, category_name: string, driver_name: string, status: 'pending' | 'accepted' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled', created_at: string, price: number }] }`
- Called by: app/(tabs)/index.tsx, app/(tabs)/orders.tsx, app/client/my-orders.tsx

### GET /deliveries/:id
- Request: `{}`
- Response: `{ id: string, status: 'pending' | 'accepted' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled', pickup_address: string, delivery_address: string, driver: { name: string, phone: string, rating: number } }`
- Called by: app/client/order-tracking.tsx, app/driver/active-delivery.tsx

### POST /deliveries
- Request: `{ category_id: string, pickup_address: string, pickup_phone: string, delivery_address: string, delivery_phone: string, description: string, weight: number, distance_km: number, price_per_km: number, total_price: number }`
- Response: `{ id: string }`
- Called by: app/client/create-delivery.tsx

### PATCH /deliveries/:id/cancel
- Request: `{}`
- Response: `{ message: string }`
- Called by: app/client/order-tracking.tsx

### PATCH /deliveries/:id
- Request: `{ [key: string]: any }`
- Response: `{ id: string }`
- Called by: Not currently used in screens

### POST /deliveries/:id/image
- Request: `{ image: File }`
- Response: `{ url: string }`
- Called by: Not currently used in screens

### POST /deliveries/:id/assign-driver
- Request: `{ driver_id: string }`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### GET /drivers/available
- Request: `{}`
- Response: `[]`
- Called by: Not currently used in screens

### GET /drivers/:id
- Request: `{}`
- Response: `{ id: string, name: string, phone: string, rating: number, vehicle: { type: string, plate: string } } | null`
- Called by: Not currently used in screens

### GET /deliveries/history
- Request: `{}`
- Response: `[]`
- Called by: Not currently used in screens

---

## driverService

### GET /driver/available-deliveries
- Request: `{}`
- Response: `{ deliveries: [{ id: string, category_name: string, estimated_price: number, total_price: number, pickup_address: string, delivery_address: string, distance_km: number }] }`
- Called by: app/driver/available-deliveries.tsx

### POST /driver/deliveries/:id/accept
- Request: `{}`
- Response: `{ message: string }`
- Called by: app/driver/available-deliveries.tsx

### POST /driver/deliveries/:id/reject
- Request: `{}`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### GET /driver/deliveries
- Request: `{ status?: 'completed' | 'cancelled' }`
- Response: `{ deliveries: [{ id: string, created_at: string, pickup_address: string, delivery_address: string, total_price: number, status: 'completed' | 'cancelled', rating: number }] }`
- Called by: app/driver/delivery-history.tsx

### PATCH /deliveries/:id/status
- Request: `{ status: 'accepted' | 'picked_up' | 'on_the_way' | 'delivered' }`
- Response: `{ message: string }`
- Called by: app/driver/active-delivery.tsx

### GET /driver/profile
- Request: `{}`
- Response: `{ id: string, name: string, phone: string, rating: number, vehicle: { type: string, plate: string }, is_online: boolean } | null`
- Called by: Not currently used in screens

### PUT /driver/profile
- Request: `{ [key: string]: any }`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### PUT /driver/online-status
- Request: `{ is_online: boolean }`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### PUT /driver/location
- Request: `{ latitude: number, longitude: number }`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### GET /driver/earnings
- Request: `{}`
- Response: `[{ id: string, amount: number, date: string }]`
- Called by: Not currently used in screens

### GET /driver/earnings/stats
- Request: `{}`
- Response: `{ total: number, count: number }`
- Called by: Not currently used in screens

---

## categoryService

### GET /categories
- Request: `{}`
- Response: `[{ id: string, name: string, icon: string, price_per_km: number }]`
- Called by: Not currently used in screens

### GET /categories/:id
- Request: `{}`
- Response: `{ id: string, name: string, icon: string, price_per_km: number } | null`
- Called by: Not currently used in screens

### GET /categories/popular
- Request: `{}`
- Response: `[{ id: string, name: string, icon: string }]`
- Called by: Not currently used in screens

### POST /categories
- Request: `{ name: string, icon: string, price_per_km: number }`
- Response: `{ id: string }`
- Called by: Not currently used in screens

### PATCH /categories/:id
- Request: `{ name: string, icon: string, price_per_km: number }`
- Response: `{ id: string }`
- Called by: Not currently used in screens

### DELETE /categories/:id
- Request: `{}`
- Response: `{ message: string }`
- Called by: Not currently used in screens

---

## notificationService

### GET /notifications
- Request: `{}`
- Response: `[{ id: string, title: string, message: string, icon: string, color: string, read: boolean, time: string }]`
- Called by: Not currently used in screens

### PATCH /notifications/:id/read
- Request: `{}`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### PUT /notifications/read-all
- Request: `{}`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### DELETE /notifications/:id
- Request: `{}`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### GET /notifications/unread-count
- Request: `{}`
- Response: `number`
- Called by: Not currently used in screens

---

## userService

### GET /users/profile
- Request: `{}`
- Response: `{ id: string, email: string, full_name: string, phone: string, avatar: string } | null`
- Called by: Not currently used in screens

### PUT /users/profile
- Request: `{ full_name?: string, phone?: string, avatar?: string }`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### POST /users/profile-picture
- Request: `{ image: File }`
- Response: `{ url: string }`
- Called by: Not currently used in screens

### PUT /users/change-password
- Request: `{ current_password: string, new_password: string }`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### DELETE /users/account
- Request: `{}`
- Response: `{ message: string }`
- Called by: Not currently used in screens

---

## statsService

### GET /stats/user
- Request: `{}`
- Response: `{ total_orders: number, total_spent: number, active_orders: number }`
- Called by: Not currently used in screens

### GET /stats/driver
- Request: `{}`
- Response: `{ total_deliveries: number, total_earnings: number, rating: number, completed_orders: number }`
- Called by: Not currently used in screens

### GET /stats/admin
- Request: `{}`
- Response: `{ total_users: number, total_deliveries: number, total_revenue: number, active_drivers: number }`
- Called by: Not currently used in screens

---

## serviceZoneService

### GET /service-zones
- Request: `{}`
- Response: `[{ id: string, name: string, coordinates: any, base_price: number }]`
- Called by: Not currently used in screens

### GET /service-zones/:id
- Request: `{}`
- Response: `{ id: string, name: string, coordinates: any, base_price: number } | null`
- Called by: Not currently used in screens

### POST /service-zones/check-point
- Request: `{ latitude: number, longitude: number }`
- Response: `{ inZone: boolean, zone_id?: string }`
- Called by: Not currently used in screens

---

## blogService

### GET /blog/posts
- Request: `{}`
- Response: `[{ id: string, title: string, content: string, author: string, created_at: string }]`
- Called by: Not currently used in screens

### POST /blog/posts
- Request: `{ title: string, content: string }`
- Response: `{ id: string }`
- Called by: Not currently used in screens

### PATCH /blog/posts/:id
- Request: `{ title: string, content: string }`
- Response: `{ id: string }`
- Called by: Not currently used in screens

### DELETE /blog/posts/:id
- Request: `{}`
- Response: `{ message: string }`
- Called by: Not currently used in screens

---

## geolocationService

### POST /geocode
- Request: `{ address: string }`
- Response: `{ lat: number, lng: number }`
- Called by: Not currently used in screens

### POST /reverse-geocode
- Request: `{ latitude: number, longitude: number }`
- Response: `{ address: string }`
- Called by: Not currently used in screens

### POST /geocode/distance
- Request: `{ origin: { lat: number, lng: number }, destination: { lat: number, lng: number } }`
- Response: `{ distance: number, unit: 'km' }`
- Called by: Not currently used in screens

### POST /geocode/estimate-time
- Request: `{ origin: { lat: number, lng: number }, destination: { lat: number, lng: number } }`
- Response: `{ estimatedTime: number, unit: 'min' }`
- Called by: Not currently used in screens

---

## adminService

### GET /admin/dashboard
- Request: `{}`
- Response: `{ total_users: number, total_deliveries: number, total_revenue: number, active_drivers: number, pending_orders: number }`
- Called by: Not currently used in screens

### GET /admin/users
- Request: `{}`
- Response: `[{ id: string, email: string, full_name: string, role: 'admin' | 'driver' | 'client', status: 'active' | 'blocked' }]`
- Called by: Not currently used in screens

### POST /admin/users/:id/block
- Request: `{}`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### POST /admin/users/:id/unblock
- Request: `{}`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### DELETE /admin/users/:id
- Request: `{}`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### GET /admin/orders
- Request: `{}`
- Response: `[{ id: string, customer: string, driver: string, amount: string, status: string, date: string, pickup: string, delivery: string }]`
- Called by: Not currently used in screens

### PATCH /admin/orders/:id/status
- Request: `{ status: string }`
- Response: `{ message: string }`
- Called by: Not currently used in screens

### GET /admin/transactions
- Request: `{}`
- Response: `[{ id: string, amount: number, date: string, type: string, status: string }]`
- Called by: Not currently used in screens

### GET /admin/system-stats
- Request: `{}`
- Response: `{ server_status: string, database_status: string, uptime: number, memory_usage: number }`
- Called by: Not currently used in screens

---

## Summary Table

| Endpoint | Method | Service | Status |
|----------|--------|---------|--------|
| /auth/login | POST | authService | ⏳ To implement |
| /auth/register | POST | authService | ⏳ To implement |
| /auth/logout | POST | authService | ⏳ To implement |
| /auth/me | GET | authService | ⏳ To implement |
| /auth/refresh | POST | authService | ⏳ To implement |
| /auth/forgot-password | POST | authService | ⏳ To implement |
| /auth/reset-password | POST | authService | ⏳ To implement |
| /auth/verify-email | POST | authService | ⏳ To implement |
| /client/deliveries | GET | deliveryService | ⏳ To implement |
| /deliveries/:id | GET | deliveryService | ⏳ To implement |
| /deliveries | POST | deliveryService | ⏳ To implement |
| /deliveries/:id/cancel | PATCH | deliveryService | ⏳ To implement |
| /deliveries/:id | PATCH | deliveryService | ⏳ To implement |
| /deliveries/:id/image | POST | deliveryService | ⏳ To implement |
| /deliveries/:id/assign-driver | POST | deliveryService | ⏳ To implement |
| /drivers/available | GET | deliveryService | ⏳ To implement |
| /drivers/:id | GET | deliveryService | ⏳ To implement |
| /deliveries/history | GET | deliveryService | ⏳ To implement |
| /driver/available-deliveries | GET | driverService | ⏳ To implement |
| /driver/deliveries/:id/accept | POST | driverService | ⏳ To implement |
| /driver/deliveries/:id/reject | POST | driverService | ⏳ To implement |
| /driver/deliveries | GET | driverService | ⏳ To implement |
| /deliveries/:id/status | PATCH | driverService | ⏳ To implement |
| /driver/profile | GET | driverService | ⏳ To implement |
| /driver/profile | PUT | driverService | ⏳ To implement |
| /driver/online-status | PUT | driverService | ⏳ To implement |
| /driver/location | PUT | driverService | ⏳ To implement |
| /driver/earnings | GET | driverService | ⏳ To implement |
| /driver/earnings/stats | GET | driverService | ⏳ To implement |
| /categories | GET | categoryService | ⏳ To implement |
| /categories/:id | GET | categoryService | ⏳ To implement |
| /categories/popular | GET | categoryService | ⏳ To implement |
| /categories | POST | categoryService | ⏳ To implement |
| /categories/:id | PATCH | categoryService | ⏳ To implement |
| /categories/:id | DELETE | categoryService | ⏳ To implement |
| /notifications | GET | notificationService | ⏳ To implement |
| /notifications/:id/read | PATCH | notificationService | ⏳ To implement |
| /notifications/read-all | PUT | notificationService | ⏳ To implement |
| /notifications/:id | DELETE | notificationService | ⏳ To implement |
| /notifications/unread-count | GET | notificationService | ⏳ To implement |
| /users/profile | GET | userService | ⏳ To implement |
| /users/profile | PUT | userService | ⏳ To implement |
| /users/profile-picture | POST | userService | ⏳ To implement |
| /users/change-password | PUT | userService | ⏳ To implement |
| /users/account | DELETE | userService | ⏳ To implement |
| /stats/user | GET | statsService | ⏳ To implement |
| /stats/driver | GET | statsService | ⏳ To implement |
| /stats/admin | GET | statsService | ⏳ To implement |
| /service-zones | GET | serviceZoneService | ⏳ To implement |
| /service-zones/:id | GET | serviceZoneService | ⏳ To implement |
| /service-zones/check-point | POST | serviceZoneService | ⏳ To implement |
| /blog/posts | GET | blogService | ⏳ To implement |
| /blog/posts | POST | blogService | ⏳ To implement |
| /blog/posts/:id | PATCH | blogService | ⏳ To implement |
| /blog/posts/:id | DELETE | blogService | ⏳ To implement |
| /geocode | POST | geolocationService | ⏳ To implement |
| /reverse-geocode | POST | geolocationService | ⏳ To implement |
| /geocode/distance | POST | geolocationService | ⏳ To implement |
| /geocode/estimate-time | POST | geolocationService | ⏳ To implement |
| /admin/dashboard | GET | adminService | ⏳ To implement |
| /admin/users | GET | adminService | ⏳ To implement |
| /admin/users/:id/block | POST | adminService | ⏳ To implement |
| /admin/users/:id/unblock | POST | adminService | ⏳ To implement |
| /admin/users/:id | DELETE | adminService | ⏳ To implement |
| /admin/orders | GET | adminService | ⏳ To implement |
| /admin/orders/:id/status | PATCH | adminService | ⏳ To implement |
| /admin/transactions | GET | adminService | ⏳ To implement |
| /admin/system-stats | GET | adminService | ⏳ To implement |
