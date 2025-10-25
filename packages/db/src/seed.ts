import { createDbConnection } from "./index.js";
import { tenants, venues, tables, menus, menuCategories, menuItems, itemOptions, itemOptionValues } from "./schema/index.js";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/inkwave";

const seed = async () => {
  const db = createDbConnection(connectionString);

  console.log("⏳ Seeding database...");

  // Check if demo tenant already exists
  const existingTenant = await db.query.tenants.findFirst({
    where: (tenants, { eq }) => eq(tenants.slug, "demo-cafe"),
  });

  let tenant;
  if (existingTenant) {
    console.log("ℹ️  Demo tenant already exists, using existing data");
    tenant = existingTenant;
  } else {
    // Create demo tenant
    [tenant] = await db
      .insert(tenants)
      .values({
        name: "Demo Café",
        slug: "demo-cafe",
        settingsJson: { theme: "default" },
      })
      .returning();
    console.log("✅ Created tenant:", tenant.name);
  }

  // Check if demo venue already exists
  const existingVenue = await db.query.venues.findFirst({
    where: (venues, { eq, and }) => 
      and(eq(venues.tenantId, tenant.id), eq(venues.slug, "branch-1")),
  });

  let venue;
  if (existingVenue) {
    console.log("ℹ️  Demo venue already exists, using existing data");
    venue = existingVenue;
  } else {
    // Create demo venue
    [venue] = await db
      .insert(venues)
      .values({
        tenantId: tenant.id,
        name: "Demo Café Branch 1",
        slug: "branch-1",
        address: "123 Main Street, Bacolod City",
        timezone: "Asia/Manila",
      })
      .returning();
    console.log("✅ Created venue:", venue.name);
  }

  // Check if tables already exist
  const existingTables = await db.query.tables.findMany({
    where: (tables, { eq }) => eq(tables.venueId, venue.id),
  });

  if (existingTables.length > 0) {
    console.log(`ℹ️  Found ${existingTables.length} existing tables, skipping table creation`);
  } else {
    // Create demo tables
    const tableLabels = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5"];
    
    for (const label of tableLabels) {
      await db.insert(tables).values({
        venueId: venue.id,
        label,
        isActive: true,
      });
    }
    console.log("✅ Created", tableLabels.length, "tables");
  }

  // Create comprehensive menu data
  await createMenuData(db, venue.id);

  console.log("✅ Seeding completed!");
  console.log(`📊 Tenant ID: ${tenant.id}`);
  console.log(`📊 Venue ID: ${venue.id}`);

  process.exit(0);
};

const createMenuData = async (db: any, venueId: string) => {
  console.log("🍽️  Creating menu data...");

  // Create menu
  const [menu] = await db
    .insert(menus)
    .values({
      venueId,
      name: "Main Menu",
      isActive: true,
    })
    .returning();

  // Create categories with icons
  const categories = [
    { name: "Pizza", icon: "🍕", imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop" },
    { name: "Pasta", icon: "🍝", imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop" },
    { name: "Drinks", icon: "🥤", imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop" },
    { name: "Desserts", icon: "🍰", imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop" },
    { name: "Sides", icon: "🍟", imageUrl: "https://images.unsplash.com/photo-1573080496219-bb075dd284b0?w=300&h=200&fit=crop" },
    { name: "Specials", icon: "⭐", imageUrl: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=300&h=200&fit=crop" }
  ];

  const createdCategories = [];
  for (let i = 0; i < categories.length; i++) {
    const [category] = await db
      .insert(menuCategories)
      .values({
        menuId: menu.id,
        name: categories[i].name,
        sortIndex: i + 1,
        iconUrl: categories[i].imageUrl,
      })
      .returning();
    createdCategories.push(category);
  }

  // Create menu items
  const menuItemsData = [
    // Pizza items
    {
      categoryId: createdCategories[0].id,
      name: "Margherita Pizza",
      description: "Classic tomato sauce, fresh mozzarella, basil",
      price: 299,
      imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop",
      isAvailable: true,
      options: [
        {
          name: "Size",
          type: "select",
          required: true,
          values: [
            { label: "Small (8\")", priceDelta: 0 },
            { label: "Medium (10\")", priceDelta: 50 },
            { label: "Large (12\")", priceDelta: 100 }
          ]
        }
      ]
    },
    {
      categoryId: createdCategories[0].id,
      name: "Pepperoni Pizza",
      description: "Spicy pepperoni, mozzarella, tomato sauce",
      price: 329,
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
      isAvailable: true,
      options: [
        {
          name: "Size",
          type: "select",
          required: true,
          values: [
            { label: "Small (8\")", priceDelta: 0 },
            { label: "Medium (10\")", priceDelta: 50 },
            { label: "Large (12\")", priceDelta: 100 }
          ]
        }
      ]
    },
    {
      categoryId: createdCategories[0].id,
      name: "BBQ Chicken Pizza",
      description: "Grilled chicken, BBQ sauce, red onions, cilantro",
      price: 359,
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      isAvailable: true,
      options: [
        {
          name: "Size",
          type: "select",
          required: true,
          values: [
            { label: "Small (8\")", priceDelta: 0 },
            { label: "Medium (10\")", priceDelta: 50 },
            { label: "Large (12\")", priceDelta: 100 }
          ]
        }
      ]
    },
    {
      categoryId: createdCategories[0].id,
      name: "Veggie Supreme",
      description: "Bell peppers, mushrooms, onions, olives, tomatoes",
      price: 319,
      imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop",
      isAvailable: true,
      options: [
        {
          name: "Size",
          type: "select",
          required: true,
          values: [
            { label: "Small (8\")", priceDelta: 0 },
            { label: "Medium (10\")", priceDelta: 50 },
            { label: "Large (12\")", priceDelta: 100 }
          ]
        }
      ]
    },

    // Pasta items
    {
      categoryId: createdCategories[1].id,
      name: "Spaghetti Carbonara",
      description: "Creamy pasta with bacon, eggs, and parmesan",
      price: 249,
      imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      isAvailable: true,
      options: []
    },
    {
      categoryId: createdCategories[1].id,
      name: "Fettuccine Alfredo",
      description: "Rich and creamy alfredo sauce with fettuccine",
      price: 229,
      imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop",
      isAvailable: true,
      options: []
    },
    {
      categoryId: createdCategories[1].id,
      name: "Penne Arrabbiata",
      description: "Spicy tomato sauce with penne pasta",
      price: 219,
      imageUrl: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=300&fit=crop",
      isAvailable: true,
      options: []
    },

    // Drinks
    {
      categoryId: createdCategories[2].id,
      name: "Fresh Orange Juice",
      description: "Freshly squeezed orange juice",
      price: 89,
      imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop",
      isAvailable: true,
      options: [
        {
          name: "Size",
          type: "select",
          required: true,
          values: [
            { label: "Small (12oz)", priceDelta: 0 },
            { label: "Large (16oz)", priceDelta: 20 }
          ]
        }
      ]
    },
    {
      categoryId: createdCategories[2].id,
      name: "Iced Coffee",
      description: "Cold brew coffee with ice",
      price: 99,
      imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop",
      isAvailable: true,
      options: [
        {
          name: "Size",
          type: "select",
          required: true,
          values: [
            { label: "Small (12oz)", priceDelta: 0 },
            { label: "Large (16oz)", priceDelta: 20 }
          ]
        }
      ]
    },
    {
      categoryId: createdCategories[2].id,
      name: "Soft Drinks",
      description: "Coke, Sprite, or Pepsi",
      price: 69,
      imageUrl: "https://images.unsplash.com/photo-1581636625402-29d2c8b1d1b0?w=400&h=300&fit=crop",
      isAvailable: true,
      options: [
        {
          name: "Drink",
          type: "select",
          required: true,
          values: [
            { label: "Coca-Cola", priceDelta: 0 },
            { label: "Sprite", priceDelta: 0 },
            { label: "Pepsi", priceDelta: 0 }
          ]
        }
      ]
    },

    // Desserts
    {
      categoryId: createdCategories[3].id,
      name: "Tiramisu",
      description: "Classic Italian dessert with coffee and mascarpone",
      price: 149,
      imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
      isAvailable: true,
      options: []
    },
    {
      categoryId: createdCategories[3].id,
      name: "Chocolate Cake",
      description: "Rich chocolate cake with ganache",
      price: 129,
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      isAvailable: true,
      options: []
    },

    // Sides
    {
      categoryId: createdCategories[4].id,
      name: "Garlic Bread",
      description: "Crispy bread with garlic butter",
      price: 79,
      imageUrl: "https://images.unsplash.com/photo-1573080496219-bb075dd284b0?w=400&h=300&fit=crop",
      isAvailable: true,
      options: []
    },
    {
      categoryId: createdCategories[4].id,
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with caesar dressing",
      price: 119,
      imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
      isAvailable: true,
      options: []
    },
    {
      categoryId: createdCategories[4].id,
      name: "French Fries",
      description: "Crispy golden french fries",
      price: 89,
      imageUrl: "https://images.unsplash.com/photo-1573080496219-bb075dd284b0?w=400&h=300&fit=crop",
      isAvailable: true,
      options: []
    },

    // Specials
    {
      categoryId: createdCategories[5].id,
      name: "Combo Meal",
      description: "Any pizza + drink + side",
      price: 399,
      imageUrl: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop",
      isAvailable: true,
      options: []
    },
    {
      categoryId: createdCategories[5].id,
      name: "Family Pack",
      description: "2 Large pizzas + 2 drinks + 1 side",
      price: 699,
      imageUrl: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop",
      isAvailable: true,
      options: []
    }
  ];

  // Create menu items and their options
  for (const itemData of menuItemsData) {
    const [menuItem] = await db
      .insert(menuItems)
      .values({
        categoryId: itemData.categoryId,
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        imageUrl: itemData.imageUrl,
        isAvailable: itemData.isAvailable,
      })
      .returning();

    // Create options for this item
    for (const optionData of itemData.options) {
      const [option] = await db
        .insert(itemOptions)
        .values({
          itemId: menuItem.id,
          name: optionData.name,
          type: optionData.type,
          required: optionData.required,
        })
        .returning();

      // Create option values
      for (const valueData of optionData.values) {
        await db
          .insert(itemOptionValues)
          .values({
            optionId: option.id,
            label: valueData.label,
            priceDelta: valueData.priceDelta,
          });
      }
    }
  }

  console.log(`✅ Created ${createdCategories.length} categories and ${menuItemsData.length} menu items`);
};

seed().catch((err) => {
  console.error("❌ Seeding failed!");
  console.error(err);
  process.exit(1);
});

