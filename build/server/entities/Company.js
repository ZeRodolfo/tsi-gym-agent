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

    // Endereço
    zipcode: { type: "varchar", nullable: true },
    street: { type: "varchar", nullable: true },
    number: { type: "varchar", nullable: true },
    neighborhood: { type: "varchar", nullable: true },
    complement: { type: "varchar", nullable: true },
    city: { type: "varchar", nullable: true },
    state: { type: "varchar", nullable: true },

    createdAt: {
      type: "datetime",
      createDate: true,
    },
    updatedAt: {
      type: "datetime",
      updateDate: true,
    },
  },
});

module.exports = { Company };
