const { EntitySchema } = require("typeorm");

const Address = new EntitySchema({
  name: "Address",
  tableName: "addresses",
  columns: {
    id: {
      type: "varchar",
      primary: true, // chave principal real
    },
    zipcode: { type: "varchar", nullable: true },
    street: { type: "varchar", nullable: true },
    number: { type: "varchar", nullable: true },
    neighborhood: { type: "varchar", nullable: true },
    complement: { type: "varchar", nullable: true },
    city: { type: "varchar", nullable: true },
    state: { type: "varchar", nullable: true },
    createdAt: {
      type: "datetime",
    },
    updatedAt: {
      type: "datetime",
    },
  },
  relations: {
    person: {
      type: "one-to-one",
      target: "Person",
      inverseSide: "address",
    },
  },
  indices: [
    {
      name: "IDX_ADDRESS",
      columns: ["id"],
      unique: true, // combinação única
    },
  ],
});

module.exports = { Address };
