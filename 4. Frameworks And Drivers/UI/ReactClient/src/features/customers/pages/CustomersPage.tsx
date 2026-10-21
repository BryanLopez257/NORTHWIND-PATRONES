import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Badge } from '@/shared/ui/Badge';
import { Dialog } from '@/shared/ui/Dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/ui/Table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/Card';
import { useDebounce } from '@/shared/utils/useDebounce';
import { useCustomers, useDeleteCustomer } from '../hooks/useCustomers';
import { CustomerDto, CustomerFilters } from '../types';
import { CustomerModal } from '../components/CustomerModal';
import { getErrorMessage } from '@/core/api/apiClient';

export const CustomersPage: React.FC = () => {
  const [searchTermInput, setSearchTermInput] = useState('');
  const debouncedSearchTerm = useDebounce(searchTermInput, 350);

  const [customerTypeFilter, setCustomerTypeFilter] = useState('Todos');
  const [balanceFilter, setBalanceFilter] = useState<number>(0);
  const [orderBy, setOrderBy] = useState<'name' | 'id' | 'balance'>('name');
  const [ascending, setAscending] = useState<boolean>(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);

  // Delete modal state
  const [customerToDelete, setCustomerToDelete] = useState<CustomerDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteCustomerMutation = useDeleteCustomer();

  const filters: CustomerFilters = {
    searchTerm: debouncedSearchTerm,
    customerType: customerTypeFilter,
    balanceFilter: balanceFilter > 0 ? balanceFilter : undefined,
    orderBy,
    ascending,
  };

  const { data: customers = [], isLoading, isError, error, refetch, isFetching } = useCustomers(filters);

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (customer: CustomerDto) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setDeleteError(null);
    try {
      await deleteCustomerMutation.mutateAsync(customerToDelete.id);
      setCustomerToDelete(null);
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err, 'No se pudo eliminar el cliente. Verifique que no posea órdenes activas.'));
    }
  };

  const getBalanceBadge = (balance: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(balance);

    if (balance <= 0) {
      return <Badge variant="success">{formatted} (Al Día)</Badge>;
    }
    if (balance < 100) {
      return <Badge variant="warning">{formatted} (Pendiente)</Badge>;
    }
    return <Badge variant="danger">{formatted} (Saldo Elevado)</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-sky-600" />
            Catálogo de Clientes
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestión de clientes, estados de cuenta comerciales y tipos de persona
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="shadow-sm shrink-0">
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filters and Search Card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-4">
              <label htmlFor="search-customers" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Búsqueda
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="search-customers"
                  placeholder="Buscar por ID o Nombre..."
                  value={searchTermInput}
                  onChange={(e) => setSearchTermInput(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Customer Type Filter */}
            <div className="md:col-span-3">
              <label htmlFor="filter-customer-type" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Tipo de Cliente
              </label>
              <select
                id="filter-customer-type"
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="Todos">Todos los Tipos</option>
                <option value="Persona Natural">Persona Natural</option>
                <option value="Empresa">Empresa</option>
              </select>
            </div>

            {/* Balance Status Filter */}
            <div className="md:col-span-3">
              <label htmlFor="filter-balance" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Estado de Saldo
              </label>
              <select
                id="filter-balance"
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(Number(e.target.value))}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value={0}>Todos los Saldos</option>
                <option value={1}>Al Día ($0.00)</option>
                <option value={2}>Con Saldo Pendiente (&gt; $0)</option>
                <option value={3}>Saldo Elevado (≥ $100)</option>
              </select>
            </div>

            {/* Order By Filter */}
            <div className="md:col-span-2 flex gap-2 items-center">
              <div className="flex-1">
                <label htmlFor="filter-order" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Ordenar
                </label>
                <select
                  id="filter-order"
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value as 'name' | 'id' | 'balance')}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="name">Nombre</option>
                  <option value="id">ID</option>
                  <option value="balance">Saldo</option>
                </select>
              </div>

              <div className="pt-5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAscending(!ascending)}
                  title={ascending ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}
                  aria-label="Alternar orden"
                  className={ascending ? 'text-sky-600' : 'text-slate-600'}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Banner */}
      {isError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span>{getErrorMessage(error, 'Error al cargar la lista de clientes.')}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-red-300 hover:bg-red-100">
            Reintentar
          </Button>
        </div>
      )}

      {/* Table Section */}
      <Card>
        <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Registros ({customers.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Lista consolidada de clientes según filtros aplicados
            </CardDescription>
          </div>
          {isFetching && (
            <div className="flex items-center gap-1.5 text-xs text-sky-600 font-medium">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Actualizando...</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead>Nombre / Razón Social</TableHead>
                <TableHead>Tipo de Cliente</TableHead>
                <TableHead>Saldo Comercial</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-sky-600" />
                      <span>Cargando directorio de clientes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-slate-300" />
                      <p className="font-medium text-slate-700">No se encontraron clientes</p>
                      <p className="text-xs text-slate-400">
                        Intente ajustar los filtros de búsqueda o registre un nuevo cliente
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-semibold text-sky-700">
                      {c.id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {c.name}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-700">
                        {c.customerType || 'Empresa'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getBalanceBadge(c.currentBalance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(c)}
                          title="Editar cliente"
                          aria-label={`Editar cliente ${c.id}`}
                          className="h-8 w-8 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteError(null);
                            setCustomerToDelete(c);
                          }}
                          title="Eliminar cliente"
                          aria-label={`Eliminar cliente ${c.id}`}
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <CustomerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        customerToEdit={selectedCustomer}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(customerToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setCustomerToDelete(null);
            setDeleteError(null);
          }
        }}
        title="Eliminar Cliente"
        description="Esta acción eliminará el cliente del sistema de forma permanente."
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 whitespace-pre-line">{deleteError}</div>
            </div>
          )}

          <p className="text-sm text-slate-600">
            ¿Está seguro de eliminar al cliente{' '}
            <strong className="text-slate-900">{customerToDelete?.name}</strong> con ID{' '}
            <span className="font-mono text-sky-700 font-semibold">{customerToDelete?.id}</span>? Esta acción no se puede deshacer.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCustomerToDelete(null);
                setDeleteError(null);
              }}
              disabled={deleteCustomerMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              isLoading={deleteCustomerMutation.isPending}
            >
              Eliminar Cliente
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
