const { EntitySchema } = require("typeorm");

const Company = new EntitySchema({
  name: "Company",
  tableName: "companies",
  columns: {
    id: {
      primary: true,
      type: "varchar",
    },
    name: { type: "varchar", nullable: true },
    companyName: { type: "varchar" },
    fantasyName: { type: "varchar", nullable: true },
    cnpj: { type: "varchar", nullable: true },
    logo: { type: "varchar", nullable: true },
    addressId: { type: "varchar", nullable: true },
    createdAt: {
      type: "datetime",
      createDate: true,
    },
    updatedAt: {
      type: "datetime",
      updateDate: true,
    },
  },
  relations: {
    address: {
      type: "one-to-one",
      target: "Address",
      inverseSide: "company",
      joinColumn: { name: "addressId" }, // ✅ define a FK corretamente
      cascade: true,
      onDelete: "SET NULL",
    },
  },
});

module.exports = { Company };
