# Raw Brand Catalog Plan

This document captures the current live-source product collections and the safest path to standardize them without breaking the existing admin UI.

## Raw collections checked on 2026-03-26

### `product_softgoods`
- row count: `2235`
- common fields: `sku`, `description`, `style_id`, `category`, `gender`, `color`, `size`, `stock_88`, `stock_90`, `mrp`, `gst`
- natural product grouping: `style_id + gender`
- natural variant axes: `color`, `size`
- major data warnings:
  - `style_id` missing on part of the source data
  - category, gender, color, and size values are inconsistent in type and casing
  - warehouse quantities arrive in source columns and should stay import-driven

### `product_hardgoods`
- row count: `1543`
- common fields: `sku`, `description`, `product_model`, `product_type`, `orientation`, `stock_88`, `mrp`, `gst`
- natural product grouping: `product_model + product_type`
- natural variant axis: `orientation`
- major data warnings:
  - `product_model` alone spans multiple product types
  - `product_type` and `orientation` need normalization before becoming filters

### `product_ogio`
- row count: `624`
- common fields: `sku`, `description`, `product_model`, `product_type`, `category`, `stock_90`, `mrp`, `gst`, `primary_image_url`, `gallery_images_url`, `variation_sku`
- natural product grouping: `product_model`
- natural variant axis: mostly SKU-driven
- major data warnings:
  - category casing is inconsistent
  - many rows have no primary image

### `product_travis`
- row count: `4033`
- common fields: `sku`, `description`, `style_code`, `category`, `gender`, `season`, `line`, `family`, `color`, `color_code`, `size`, `stock_88`, `stock_90`, `mrp`, `gst`, `primary_image_url`, `gallery_images_url`, `variation_sku`
- natural product grouping: `style_code`
- natural variant axes: `color`, `size`
- major data warnings:
  - category and color are missing in part of the source
  - season and line values are inconsistent in casing and naming
  - many rows have no primary image

## Standard catalog model while keeping separate brand collections

Keep the raw source collections separate:
- `product_softgoods`
- `product_hardgoods`
- `product_ogio`
- `product_travis`

Introduce one shared normalized catalog contract in code:
- `catalog product`
  - `brandCode`
  - `sectionSlug`
  - `sourceCollection`
  - `sourceGroupingKey`
  - `name`
  - `category`
  - `subcategory`
  - `productType`
  - `attributeSetId`
  - `productAttributes`
  - `filterValues`
  - `mediaSummary`
  - `status`
  
- `catalog variant`
  - `sku`
  - `optionValues`
  - `variantAttributes`
  - `mrp`
  - `gst`
  - `warehouseStock`
  - `imageRefs`
- `catalog inventory`
  - `variantSku` or `variantId`
  - `warehouseCode`
  - `onHand`
  - `reserved`
  - `blocked`
  - `available`

The UI should consume this shared contract, but the import jobs should still read from brand-specific raw collections.

## Warehouse settings design

Add one admin-controlled policy layer before write imports go live.

Recommended policy shape:
- `brandCode`
- `allowedWarehouseCodes`
- `defaultWarehouseCode`
- `autoAssignMode`
- `inventorySourceColumns`
- `allowCrossWarehouseAvailability`
- `warnOnPolicyChange`

Recommended UI placement:
- first read-only summary in `/admin/imports`
- then editable settings in `/admin/warehouses` or a dedicated `/admin/imports/catalog-settings` route

Any policy change should warn because it affects:
- stock rollups
- default warehouse assignment
- import validation
- visible availability on catalog and order screens

## Import lanes

Split imports into three lanes.

### 1. Catalog master import
- purpose: create or refresh product structure
- frequency: occasional or season-based
- writes: grouped product records, variant records, stable attributes
- source: brand raw collection or uploaded master sheet

### 2. Daily inventory import
- purpose: update stock only
- frequency: daily
- writes: warehouse inventory rows only
- source: `stock_88`, `stock_90`, or future warehouse-mapped columns
- must not overwrite titles, categories, images, or grouping keys

### 3. Image import
- purpose: attach or update media
- frequency: separate from catalog and stock
- writes: image references only
- source: upload job or media mapping sheet

## Safe rollout order

1. Keep the current UI intact.
2. Add shared source definitions and read-only import blueprint.
3. Build brand-specific loaders that transform raw collections into the shared catalog view model.
4. Move filtering, sorting, and pagination to server-side queries.
5. Add warehouse-brand policy settings with warning flows.
6. Add catalog master import actions.
7. Add daily inventory-only import actions.
8. Add image-only import actions.

This order lets the team standardize the behavior first, then introduce writes after the policy and validation rules are visible in admin.
