import { pgTable, serial, varchar, integer, real, json, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { hu } from 'zod/locales';
import { meta } from 'zod/v4/core';

// Enums
export const driverManagerCategoryEnum = pgEnum('DriverManagerCategory', ['main', 'intermediate']);
export const hubManagerCategoryEnum = pgEnum('HubManagerCategory', ['main', 'intermediate']);
export const orderStatusEnum = pgEnum('OrderStatus', ['created', 'pending', 'in_transit', 'in_source', 'in_hub', 'delivered', 'cancelled']);
export const vehicleStatusEnum = pgEnum('vehicleStatus', ['occupied', 'available']);
export const driverManagerStatusEnum = pgEnum('driverManagerStatus', ['occupied', 'available']);

// Tables
export const driverManager = pgTable('DriverManager', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull().unique(),
  status: driverManagerStatusEnum('status').notNull(),
  phone: varchar('phone').notNull().unique(),
  hubmanagerId: integer('hubmanagerId').notNull().references(() => hubManager.id),
  address: varchar('address').notNull(),
  geoLat: real('geoLat').notNull(),
  geoLng: real('geoLng').notNull(),
  token: varchar('token').notNull().unique(),
  category: driverManagerCategoryEnum('category').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const hubManager = pgTable('HubManager', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull().unique(),
  phone: varchar('phone').notNull().unique(),
  token: varchar('token').notNull().unique(),
  address: varchar('address').notNull(),
  geoLat: real('geoLat').notNull(),
  geoLng: real('geoLng').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  hubmanagerCategory: hubManagerCategoryEnum('hubmanagerCategory').notNull(),
  mainHubManagerId: integer('mainHubManagerId').references(() => hubManager.id),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const shop = pgTable('Shop', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  phone: varchar('phone').notNull().unique(),
  geoLat: real('geoLat').notNull(),
  geoLng: real('geoLng').notNull(),
  address: varchar('address').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const order = pgTable('Order', {
  id: serial('id').primaryKey(),
  shopId: integer('shopId').notNull().references(() => shop.id),
  hubmanagerId: integer('hubmanagerId').notNull().references(() => hubManager.id),
  vehicleId: integer('vehicleId').references(() => vehicle.id),
  metadata: json('metadata'),
  status: orderStatusEnum('status').notNull().default('created'),
  deliveryDate: timestamp('deliveryDate'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const vehicle = pgTable('vehicle', {
  id: serial('id').primaryKey(),
  number: varchar('number').notNull().unique(),
  model: varchar('model').notNull(),
  drivermanagerId: integer('drivermanagerId').references(() => driverManager.id),
  metadata: json('metadata'),
  status: vehicleStatusEnum('status').notNull(),
  hubmanagerId: integer('hubmanagerId').notNull().references(() => hubManager.id),
  capacity: real('capacity').notNull(),
  createdAt: timestamp('createdAt', { precision: 6 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { precision: 6 }).notNull().defaultNow(),
});

export const orderItem = pgTable('OrderItem', {
  id: serial('id').primaryKey(),
  orderId: integer('orderId').notNull().references(() => order.id, { onDelete: 'cascade' }),
  productId: integer('productId').notNull().references(() => product.id),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (table) => ({
  uniqueOrderProduct: uniqueIndex('unique_order_product').on(table.orderId, table.productId),
}));

export const product = pgTable('Product', {
  id: serial('id').primaryKey(),
  title: varchar('title').notNull(),
  description: varchar('description').notNull(),
  price: real('price').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('createdAt', { precision: 6 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { precision: 6 }).notNull().defaultNow(),
  quantity: integer('quantity').notNull(),
});

// Relations
export const driverManagerRelations = relations(driverManager, ({ many }) => ({
  vehicles: many(vehicle),
}));

export const hubManagerRelations = relations(hubManager, ({ many, one }) => ({
  orders: many(order),
  intermediateHubManagers: many(hubManager, {
    relationName: 'mainToIntermediate',
  }),
  mainHubManager: one(hubManager, {
    fields: [hubManager.mainHubManagerId],
    references: [hubManager.id],
    relationName: 'mainToIntermediate',
  }),
}));

export const shopRelations = relations(shop, ({ many }) => ({
  orders: many(order),
}));

export const orderRelations = relations(order, ({ one, many }) => ({
  shop: one(shop, {
    fields: [order.shopId],
    references: [shop.id],
  }),
  hubManager: one(hubManager, {
    fields: [order.hubmanagerId],
    references: [hubManager.id],
  }),
  vehicle: one(vehicle, {
    fields: [order.vehicleId],
    references: [vehicle.id],
  }),
  orderItems: many(orderItem),
}));

export const vehicleRelations = relations(vehicle, ({ one, many }) => ({
  driverManager: one(driverManager, {
    fields: [vehicle.drivermanagerId],
    references: [driverManager.id],
  }),
  orders: many(order),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
}));

export const productRelations = relations(product, ({ many }) => ({
  orderItems: many(orderItem),
}));
