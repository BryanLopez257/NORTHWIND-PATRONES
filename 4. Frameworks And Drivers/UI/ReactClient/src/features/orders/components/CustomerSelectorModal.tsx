import React, { useState, useMemo } from 'react';
import { Search, Check, AlertCircle, Users, ShieldAlert, Lock, Building2, User } from 'lucide-react';
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
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Persona Natural' | 'Empresa'>('Todos');

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

      // Realtime text search by name or ID
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchesName = c.name.toLowerCase().includes(term);
        const matchesId = c.id.toLowerCase().includes(term);
        if (!matchesName && !matchesId) return false;
      }

      return true;
    });
  }, [customers, typeFilter, searchTerm]);

  const handleSelect = (customer: CustomerDto) => {
    if (customer.currentBalance > 0) {
      return; // Physically blocked
    }
    onSelectCustomer(customer);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Seleccionar Cliente para la Orden"
      description="Seleccione un cliente con saldo al día para autorizar la emisión del pedido."
      className="max-w-4xl"
    >
      <div className="space-y-4">
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

        {/* Controles de Búsqueda y Segmentación */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Botones de segmentación por Tipo de Cliente con contadores en vivo */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit border border-slate-200">
            <button
              type="button"
              onClick={() => setTypeFilter('Todos')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5',
                typeFilter === 'Todos'
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
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
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
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
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Empresas ({counts.empresas})</span>
            </button>
          </div>

          {/* Barra de búsqueda en tiempo real */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs sm:text-sm h-9"
              autoFocus
            />
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
                  <TableHead className="text-right w-36">Acción</TableHead>
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
                        isCurrentlySelected && 'bg-sky-50/50',
                        isBlocked && 'bg-rose-50/20'
                      )}
                    >
                      <TableCell className="font-mono font-bold text-xs text-sky-700">
                        {customer.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{customer.name}</div>
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
                            disabled
                            className="h-8 px-2 text-xs opacity-80 cursor-not-allowed bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-50"
                            title="Cliente bloqueado por mantener saldo pendiente"
                          >
                            <Lock className="h-3.5 w-3.5 mr-1 text-rose-600 shrink-0" />
                            <span>Moroso / Bloqueado</span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSelect(customer)}
                            className="h-8 px-3 text-xs bg-sky-600 hover:bg-sky-700 text-white flex items-center space-x-1 ml-auto"
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
