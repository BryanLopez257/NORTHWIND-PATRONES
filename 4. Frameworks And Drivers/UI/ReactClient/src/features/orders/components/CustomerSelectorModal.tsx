import React, { useState, useMemo } from 'react';
import { Search, Check, AlertCircle, Users, ShieldAlert, Lock, Building2, User, X } from 'lucide-react';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { CustomerDto } from '@/features/customers/types';
import { Dialog } from '@/shared/ui/Dialog';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/Table';
import { cn } from '@/shared/utils/cn';

export interface CustomerSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCustomer: (customer: CustomerDto) => void;
  selectedCustomerId?: string;
}

export const CustomerSelectorModal: React.FC<CustomerSelectorModalProps> = ({
  open,
  onOpenChange,
  onSelectCustomer,
  selectedCustomerId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<'all' | 'name' | 'id'>('all');
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Persona Natural' | 'Empresa'>('Todos');
  const [blockedWarning, setBlockedWarning] = useState<string | null>(null);

  const { data: customers = [], isLoading, error } = useCustomers();

  // Live segmentation counters
  const counts = useMemo(() => {
    const todos = customers.length;
    const personas = customers.filter((c) => c.customerType === 'Persona Natural').length;
    const empresas = customers.filter((c) => c.customerType === 'Empresa').length;
    return { todos, personas, empresas };
  }, [customers]);

  // Real-time filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Type segmentation
      if (typeFilter !== 'Todos' && c.customerType !== typeFilter) {
        return false;
      }

      // Realtime text search by criterion
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        if (searchCriteria === 'id') {
          return c.id.toLowerCase().includes(term);
        }
        if (searchCriteria === 'name') {
          return c.name.toLowerCase().includes(term);
        }
        return c.name.toLowerCase().includes(term) || c.id.toLowerCase().includes(term);
      }

      return true;
    });
  }, [customers, typeFilter, searchTerm, searchCriteria]);

  const handleSelect = (customer: CustomerDto) => {
    if (customer.currentBalance > 0) {
      setBlockedWarning(
        `No se puede seleccionar al cliente '${customer.name}' (${customer.id}) porque posee un saldo deudor pendiente de $${Number(customer.currentBalance).toFixed(2)}. Los clientes con saldo pendiente no están autorizados para emitir nuevas órdenes.`
      );
      return;
    }
    setBlockedWarning(null);
    onSelectCustomer(customer);
    onOpenChange(false);
  };

  const getPlaceholder = () => {
    if (searchCriteria === 'id') return 'Buscar específicamente por código (ej: ALFKI)...';
    if (searchCriteria === 'name') return 'Buscar específicamente por nombre o razón social...';
    return 'Buscar por código o nombre de cliente...';
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) setBlockedWarning(null);
        onOpenChange(val);
      }}
      title="Seleccionar Cliente para la Orden"
      description="Seleccione un cliente con saldo al día para autorizar la emisión del pedido."
      className="max-w-4xl"
    >
      <div className="space-y-4 pt-1">
        {/* Banner de Condición de Crédito */}
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start space-x-3 shadow-xs">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-amber-900 block sm:inline mr-1">
              Condición de Crédito:
            </span>
            <span>
              Solo se permite crear órdenes a clientes con saldo $0.00. Clientes con saldo pendiente están bloqueados.
            </span>
          </div>
        </div>

        {/* Alerta Reactiva de Advertencia si se intenta interactuar con un cliente moroso */}
        {blockedWarning && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm flex items-start space-x-2 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Operación No Permitida:</span>
              <span>{blockedWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setBlockedWarning(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Controles de Búsqueda y Segmentación */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Botones de segmentación por Tipo de Cliente con contadores en vivo */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit border border-slate-200">
            <button
              type="button"
              onClick={() => setTypeFilter('Todos')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5',
                typeFilter === 'Todos'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              )}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Todos ({counts.todos})</span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('Persona Natural')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5',
                typeFilter === 'Persona Natural'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              )}
            >
              <User className="h-3.5 w-3.5" />
              <span>Personas Naturales ({counts.personas})</span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('Empresa')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5',
                typeFilter === 'Empresa'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Empresas ({counts.empresas})</span>
            </button>
          </div>

          {/* Barra de búsqueda con selector de criterio y botón limpiar */}
          <div className="flex items-center gap-2 flex-1 md:max-w-md">
            <select
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value as 'all' | 'name' | 'id')}
              className="text-xs h-9 rounded-lg border border-slate-300 bg-white px-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">🔍 Todos</option>
              <option value="name">👤 Nombre</option>
              <option value="id">🏷️ Código (ID)</option>
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder={getPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 text-xs sm:text-sm h-9"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  title="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de Clientes */}
        <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">
              <Users className="h-8 w-8 mx-auto text-slate-400 animate-spin mb-2" />
              Cargando catálogo de clientes...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-600 flex items-center justify-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Error al obtener clientes. Por favor intente nuevamente.</span>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No se encontraron clientes coincidentes con los criterios de búsqueda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Nombre / Razón Social</TableHead>
                  <TableHead>Tipo de Cliente</TableHead>
                  <TableHead className="text-right">Saldo Actual</TableHead>
                  <TableHead className="text-right w-44">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const isBlocked = customer.currentBalance > 0;
                  const isCurrentlySelected = selectedCustomerId === customer.id;

                  return (
                    <TableRow
                      key={customer.id}
                      className={cn(
                        isCurrentlySelected && 'bg-blue-50/50',
                        isBlocked && 'bg-rose-50/20'
                      )}
                    >
                      <TableCell className="font-mono font-bold text-xs text-blue-700">
                        {customer.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{customer.name}</div>
                        {isBlocked ? (
                          <span className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            Bloqueado por saldo pendiente
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                            <Check className="w-3 h-3 shrink-0" />
                            Habilitado para compra
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.customerType === 'Empresa' ? (
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
                      <TableCell className="text-right">
                        {customer.currentBalance <= 0 ? (
                          <Badge variant="success" className="font-mono">
                            $0.00
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="font-mono">
                            ${Number(customer.currentBalance).toFixed(2)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isBlocked ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSelect(customer)}
                            className="h-8 px-2 text-xs bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100"
                            title="Haga clic para ver el motivo de bloqueo"
                          >
                            <Lock className="h-3.5 w-3.5 mr-1 text-rose-600 shrink-0" />
                            <span>Moroso / Bloqueado</span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSelect(customer)}
                            className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 ml-auto"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>{isCurrentlySelected ? 'Seleccionado' : 'Seleccionar'}</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-500">
            Mostrando {filteredCustomers.length} de {customers.length} clientes
          </span>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
