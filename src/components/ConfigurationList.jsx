import React, { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/Table";
import { Tabs, TabsContent } from "./ui/Tabs";
import { Label } from "./ui/Label";
import { Button } from "./ui/Button";

import { GrEdit } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
import RegisterCatracaConfigModal from "./RegisterCatracaConfigModal";
import { fetchCatracasAll } from "services/catracas";
import { fetchPrintersAll } from "services/printers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FreeCatracaModal } from "./FreeCatracaModal";
import { FaDoorOpen } from "react-icons/fa6";
import { BsFillPrinterFill } from "react-icons/bs";
import { toast } from "react-toastify";

function CustomRow({ row }) {
  const { transform, transition, setNodeRef } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      ref={setNodeRef}
      className="relative z-0"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className={
            cell.column.id === "actions"
              ? "sticky right-0 z-0 flex justify-end py-2"
              : ""
          }
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function ConfigurationList() {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [openCatracaModal, setOpenCatracaModal] = useState(null);

  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [settings, setSettings] = useState(null);
  const queryClient = useQueryClient();
  const { data: catracas, isLoading: isLoadingCatraca } = useQuery({
    queryKey: ["catracas-all"],
    queryFn: fetchCatracasAll,
    initialData: [], // opcional, começa vazio
  });
  const { data: printers, isLoading: isLoadingPrinter } = useQuery({
    queryKey: ["printers-all"],
    queryFn: fetchPrintersAll,
    initialData: [], // opcional, começa vazio
  });

  const data = {
    data: [
      ...catracas?.map((item) => ({ ...item, type: "catraca" })),
      ...printers?.map((item) => ({ ...item, type: "printer" })),
    ],
    meta: {
      total: catracas?.length + printers?.length || 0,
      lastPage: 1,
      currentPage: 1,
      perPage: catracas?.length + printers?.length || 0,
      prev: 1,
      next: 1,
    },
  }; // Replace with actual data fetching logic
  const suppliers = data?.data;
  const meta = data?.meta;

  const handlePrint = async (item) => {
    window.printerAPI.print(item?.printer, "test", {
      text: "Olá impressora!",
    });
    toast.success("Enviado para impressão com sucesso.");
  };

  const columns = [
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        return row?.original?.type === "catraca" ? "Catraca" : "Impressora";
      },
      enableHiding: false,
      size: 100,
    },
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => {
        return row?.original?.catraca?.name || row?.original?.printer?.name;
      },
      enableHiding: false,
      size: 800,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="sticky right-0 z-10 flex justify-end gap-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            title="Editar"
            onClick={() => {
              setRegisterModalOpen(true);
              setSettings(row.original);
            }}
          >
            <GrEdit size={16} />
          </Button>

          {row?.original?.type === "catraca" ? (
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              title="Liberar Catraca"
              onClick={() => setOpenCatracaModal(row?.original)}
            >
              <FaDoorOpen size={16} className="text-green-600" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              title="Teste de Impressão"
              onClick={() => handlePrint(row?.original)}
            >
              <BsFillPrinterFill size={16} className="text-green-600" />
            </Button>
          )}

          {/* <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            title="Excluir"
          >
            <MdDelete size={18} className="text-red-700" />
          </Button> */}
        </div>
      ),
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: suppliers || [],
    columns,
    state: {
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      setPagination((old) => ({ ...old, ...updater }));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: meta?.lastPage || -1,
  });

  return (
    <Tabs defaultValue="all" className="w-full flex-col justify-start gap-6">
      <div className="flex md:items-center justify-between px-4 lg:px-6 flex-wrap">
        <div>
          <Label className="!text-lg font-medium">
            Dispositivos cadastrados
          </Label>
        </div>

        <div className="flex items-center gap-x-2 md:ml-auto">
          <Button
            variant="primary"
            size="sm"
            className="px-2 py-1"
            onClick={() => {
              setRegisterModalOpen(true);
              setSettings(null);
            }}
          >
            <IconPlus />
            Adicionar
          </Button>
        </div>
      </div>
      <TabsContent
        value="all"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="!bg-gray-100">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={
                        header.column.id === "actions"
                          ? "sticky right-0 bg-muted z-10 flex justify-end py-2"
                          : "font-bold"
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <CustomRow key={row.id} row={row} />
                  ))}
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    sem resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <RegisterCatracaConfigModal
        isOpen={registerModalOpen}
        data={settings}
        onClose={() => {
          queryClient.invalidateQueries({ queryKey: ["catracas-all"] });
          queryClient.invalidateQueries({ queryKey: ["printers-all"] });
          setRegisterModalOpen(false);
        }}
      />

      <FreeCatracaModal
        isOpen={!!openCatracaModal}
        catraca={openCatracaModal}
        onClose={() => setOpenCatracaModal(null)}
      />
    </Tabs>
  );
}
