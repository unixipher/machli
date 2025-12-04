import { pgTable, serial, text, timestamp, real, integer, json, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const driverCategoryEnum = pgEnum('DriverCategory', ['LARGE', 'SMALL']);
export const orderStatusEnum = pgEnum('OrderStatus', ['CREATED', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']);

export const manager = pgTable('Manager', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const driver = pgTable('Driver', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  token: text('token').notNull().unique(),
  category: driverCategoryEnum('category').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const shopOwner = pgTable('ShopOwner', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  token: text('token').notNull().unique(),
  geoLat: real('geoLat').notNull(),
  geoLng: real('geoLng').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const product = pgTable('Product', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const order = pgTable('Order', {
  id: serial('id').primaryKey(),
  shopOwnerId: integer('shopOwnerId').notNull().references(() => shopOwner.id),
  driverId: integer('driverId').notNull().references(() => driver.id),
  productId: integer('productId').notNull(),
  managerId: integer('managerId').notNull(),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const driverRelations = relations(driver, ({ many }) => ({
  orders: many(order),
}));

export const shopOwnerRelations = relations(shopOwner, ({ many }) => ({
  orders: many(order),
}));

export const orderRelations = relations(order, ({ one }) => ({
  shopOwner: one(shopOwner, {
    fields: [order.shopOwnerId],
    references: [shopOwner.id],
  }),
  driver: one(driver, {
    fields: [order.driverId],
    references: [driver.id],
  }),
}));
