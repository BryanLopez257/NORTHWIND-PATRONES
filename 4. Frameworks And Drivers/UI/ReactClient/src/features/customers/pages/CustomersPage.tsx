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
  User,
  Building2,
  RotateCcw,
  CheckCircle2,
  Clock,
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
import { cn } from '@/shared/utils/cn';

export const CustomersPage: React.FC = () => {
  const [searchTermInput, setSearchTermInput] = useState('');
  const debouncedSearchTerm = useDebounce(searchTermInput, 350);

  const [customerTypeFilter, setCustomerTypeFilter] = useState('Todos');
  const [balanceFilter, setBalanceFilter] = useState<number>(0);
  const [minBalanceInput, setMinBalanceInput] = useState<string>('');
  const [maxBalanceInput, setMaxBalanceInput] = useState<string>('');
  const [orderBy, setOrderBy] = useState<'name' | 'id' | 'balance'>('name');
  const [ascending, setAscending] = useState<boolean>(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);

  // Delete modal state
  const [customerToDelete, setCustomerToDelete] = useState<CustomerDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteCustomerMutation = useDeleteCustomer();

  const parsedMinBalance = minBalanceInput !== '' && !isNaN(Number(minBalanceInput)) ? Number(minBalanceInput) : undefined;
  const parsedMaxBalance = maxBalanceInput !== '' && !isNaN(Number(maxBalanceInput)) ? Number(maxBalanceInput) : undefined;

  const filters: CustomerFilters = {
    searchTerm: debouncedSearchTerm,
    customerType: customerTypeFilter !== 'Todos' ? customerTypeFilter : undefined,
    balanceFilter: balanceFilter > 0 ? balanceFilter : undefined,
    minBalance: parsedMinBalance,
    maxBalance: parsedMaxBalance,
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

  const handleResetFilters = () => {
    setSearchTermInput('');
    setCustomerTypeFilter('Todos');
    setBalanceFilter(0);
    setMinBalanceInput('');
    setMaxBalanceInput('');
    setOrderBy('name');
    setAscending(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setDeleteError(null);
    try {
      await deleteCustomerMutation.mutateAsync(customerToDelete.id);
      setCustomerToDelete(null);
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err, 'No se pudo eliminar el cliente. Verifique que no posea órdenes activas en el sistema.'));
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-blue-600" />
            Gestión de Clientes
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Administra los clientes comerciales, sus límites y balances de cuenta con segmentación de saldos.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="shadow-sm shrink-0">
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Segmentación Superior de Tipo de Cliente */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl w-fit border border-slate-200">
        <button
          type="button"
          onClick={() => setCustomerTypeFilter('Todos')}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2',
            customerTypeFilter === 'Todos'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          )}
        >
          <Users className="h-4 w-4" />
          <span>Todos los Clientes</span>
        </button>

        <button
          type="button"
          onClick={() => setCustomerTypeFilter('Persona Natural')}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2',
            customerTypeFilter === 'Persona Natural'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          )}
        >
          <User className="h-4 w-4" />
          <span>Personas Naturales</span>
        </button>

        <button
          type="button"
          onClick={() => setCustomerTypeFilter('Empresa')}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2',
            customerTypeFilter === 'Empresa'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          )}
        >
          <Building2 className="h-4 w-4" />
          <span>Empresas</span>
        </button>
      </div>

      {/* Filters and Search Card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-4">
              <label htmlFor="search-customers" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Búsqueda por Nombre o Código
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="search-customers"
                  placeholder="Buscar por código o nombre de cliente..."
                  value={searchTermInput}
                  onChange={(e) => setSearchTermInput(e.target.value)}
                  className="pl-9"
                />
              </div>
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
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Todos los Saldos</option>
                <option value={1}>🟢 Al Día ($0.00)</option>
                <option value={2}>🟡 Con Saldo Pendiente (&gt; $0.00)</option>
                <option value={3}>🔴 Saldo Elevado (≥ $100.00)</option>
              </select>
            </div>

            {/* Balance Range Inputs */}
            <div className="md:col-span-2 flex gap-2">
              <div className="w-1/2">
                <label htmlFor="min-balance" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Mín ($)
                </label>
                <Input
                  id="min-balance"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="0"
                  value={minBalanceInput}
                  onChange={(e) => setMinBalanceInput(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="max-balance" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Máx ($)
                </label>
                <Input
                  id="max-balance"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="500"
                  value={maxBalanceInput}
                  onChange={(e) => setMaxBalanceInput(e.target.value)}
                />
              </div>
            </div>

            {/* Order By Filter & Reset */}
            <div className="md:col-span-3 flex gap-2 items-center">
              <div className="flex-1">
                <label htmlFor="filter-order" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Ordenar
                </label>
                <select
                  id="filter-order"
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value as 'name' | 'id' | 'balance')}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Nombre</option>
                  <option value="id">Código ID</option>
                  <option value="balance">Saldo Actual</option>
                </select>
              </div>

              <div className="pt-5 flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAscending(!ascending)}
                  title={ascending ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}
                  aria-label="Alternar orden"
                  className={ascending ? 'text-blue-600' : 'text-slate-600'}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleResetFilters}
                  title="Limpiar filtros"
                  aria-label="Limpiar filtros"
                  className="text-slate-600 hover:text-slate-900"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chips Rápidos de Segmentación de Saldo */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
              Filtro Rápido:
            </span>
            <button
              type="button"
              onClick={() => {
                setBalanceFilter(0);
                setMinBalanceInput('');
                setMaxBalanceInput('');
              }}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                balanceFilter === 0 && !minBalanceInput && !maxBalanceInput
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => {
                setBalanceFilter(1);
                setMinBalanceInput('');
                setMaxBalanceInput('');
              }}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                balanceFilter === 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              )}
            >
              🟢 Al Día ($0.00)
            </button>
            <button
              type="button"
              onClick={() => {
                setBalanceFilter(2);
                setMinBalanceInput('');
                setMaxBalanceInput('');
              }}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                balanceFilter === 2
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              )}
            >
              🟡 Con Saldo Pendiente
            </button>
            <button
              type="button"
              onClick={() => {
                setBalanceFilter(3);
                setMinBalanceInput('');
                setMaxBalanceInput('');
              }}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                balanceFilter === 3
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              )}
            >
              🔴 Saldo Elevado (≥ $100)
            </button>
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

      {/* Table Section: Canonical 6 Columns */}
      <Card>
        <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Listado de Clientes ({customers.length} registros)
            </CardTitle>
            <CardDescription className="text-xs">
              Directorio comercial clasificado con control de crédito
            </CardDescription>
          </div>
          {isFetching && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Actualizando...</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Código (ID)</TableHead>
                <TableHead>Nombre / Razón Social</TableHead>
                <TableHead>Tipo de Cliente</TableHead>
                <TableHead className="text-right">Saldo Actual</TableHead>
                <TableHead className="text-center w-36">Estado</TableHead>
                <TableHead className="text-right w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                      <span>Cargando directorio de clientes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-500">
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
                customers.map((c) => {
                  const isZeroBalance = c.currentBalance <= 0;
                  const isHighBalance = c.currentBalance >= 100;

                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-semibold text-blue-700">
                        {c.id}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {c.name}
                      </TableCell>
                      <TableCell>
                        {c.customerType === 'Empresa' ? (
                          <Badge variant="info" className="flex items-center w-fit space-x-1">
                            <Building2 className="h-3 w-3" />
                            <span>Empresa</span>
                          </Badge>
                        ) : (
                          <Badge variant="default" className="flex items-center w-fit space-x-1">
                            <User className="h-3 w-3" />
                            <span>Persona Natural</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        <span className={isZeroBalance ? 'text-emerald-700' : 'text-rose-600'}>
                          {formatCurrency(c.currentBalance)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {isZeroBalance ? (
                          <Badge variant="success" className="inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Al Día</span>
                          </Badge>
                        ) : isHighBalance ? (
                          <Badge variant="danger" className="inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Saldo Alto</span>
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Con Saldo</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(c)}
                            title="Editar cliente"
                            aria-label={`Editar cliente ${c.id}`}
                            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
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
                  );
                })
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
            <span className="font-mono text-blue-700 font-semibold">{customerToDelete?.id}</span>? Esta acción no se puede deshacer.
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
