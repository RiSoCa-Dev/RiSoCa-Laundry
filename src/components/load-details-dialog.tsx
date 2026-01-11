'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Layers, Edit2, Check, X, Loader2, Users } from 'lucide-react';
import type { Order } from './order-list/types';
import { cn } from '@/lib/utils';
import { useEmployees } from '@/hooks/use-employees';
import { format } from 'date-fns';

type LoadDetailsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onUpdateOrder: (order: Order) => Promise<void>;
};

export function LoadDetailsDialog({
  isOpen,
  onClose,
  order,
  onUpdateOrder,
}: LoadDetailsDialogProps) {
  const [editingLoadIndex, setEditingLoadIndex] = useState<number | null>(null);
  const [editingPieceValue, setEditingPieceValue] = useState<string>('');
  const [editingEmployeeLoadIndex, setEditingEmployeeLoadIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadPieces, setLoadPieces] = useState<(number | null)[]>([]);
  const [loadEmployees, setLoadEmployees] = useState<(string[] | null)[]>([]);
  const { employees, loading: loadingEmployees } = useEmployees();

  // Initialize loadPieces and loadEmployees arrays when dialog opens or order changes
  useEffect(() => {
    if (isOpen && order) {
      const pieces: (number | null)[] = [];
      const employees: (string[] | null)[] = [];
      
      // For now, we'll use the order's assigned employees for all loads
      // Later we can add per-load employee storage
      const defaultEmployees = order.assignedEmployeeIds || 
        (order.assignedEmployeeId ? [order.assignedEmployeeId] : null);
      
      for (let i = 0; i < order.load; i++) {
        pieces.push(order.loadPieces?.[i] ?? null);
        employees.push(defaultEmployees);
      }
      
      setLoadPieces(pieces);
      setLoadEmployees(employees);
    }
  }, [isOpen, order]);

  const handleEditPieceStart = (loadIndex: number) => {
    setEditingLoadIndex(loadIndex);
    setEditingPieceValue(
      loadPieces[loadIndex] !== null && loadPieces[loadIndex] !== undefined
        ? String(loadPieces[loadIndex])
        : ''
    );
  };

  const handleEditPieceCancel = () => {
    setEditingLoadIndex(null);
    setEditingPieceValue('');
  };

  const handlePieceSave = async (loadIndex: number) => {
    setIsSaving(true);
    try {
      const numericValue =
        editingPieceValue.trim() === ''
          ? null
          : Number(editingPieceValue);
      
      if (numericValue !== null && (isNaN(numericValue) || numericValue < 0)) {
        handleEditPieceCancel();
        setIsSaving(false);
        return;
      }

      const currentValue = loadPieces[loadIndex];
      if (currentValue === numericValue) {
        handleEditPieceCancel();
        setIsSaving(false);
        return;
      }

      const newLoadPieces = [...loadPieces];
      newLoadPieces[loadIndex] = numericValue;

      const hasAnyPieces = newLoadPieces.some(
        (p) => p !== null && p !== undefined
      );

      const updatedOrder: Order = {
        ...order,
        loadPieces: hasAnyPieces ? newLoadPieces : undefined,
      };

      await onUpdateOrder(updatedOrder);
      setLoadPieces(newLoadPieces);
      setEditingLoadIndex(null);
      setEditingPieceValue('');
    } catch (error) {
      console.error('Error saving load pieces:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmployeeToggle = (loadIndex: number, employeeId: string) => {
    const currentEmployees = loadEmployees[loadIndex] || [];
    const newEmployees = currentEmployees.includes(employeeId)
      ? currentEmployees.filter(id => id !== employeeId)
      : [...currentEmployees, employeeId];
    
    const newLoadEmployees = [...loadEmployees];
    newLoadEmployees[loadIndex] = newEmployees.length > 0 ? newEmployees : null;
    setLoadEmployees(newLoadEmployees);
  };

  const handleEmployeeSave = async (loadIndex: number) => {
    setIsSaving(true);
    try {
      // For now, we'll update the order's assignedEmployeeIds
      // This is a temporary solution - ideally we'd store per-load employees separately
      const newEmployees = loadEmployees[loadIndex];
      
      const updatedOrder: Order = {
        ...order,
        assignedEmployeeIds: newEmployees && newEmployees.length > 0 ? newEmployees : undefined,
        assignedEmployeeId: newEmployees && newEmployees.length > 0 ? newEmployees[0] : null,
      };

      await onUpdateOrder(updatedOrder);
      setEditingEmployeeLoadIndex(null);
    } catch (error) {
      console.error('Error saving load employees:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmployeeEditCancel = (loadIndex: number) => {
    // Reset to original employees
    const defaultEmployees = order.assignedEmployeeIds || 
      (order.assignedEmployeeId ? [order.assignedEmployeeId] : null);
    const newLoadEmployees = [...loadEmployees];
    newLoadEmployees[loadIndex] = defaultEmployees;
    setLoadEmployees(newLoadEmployees);
    setEditingEmployeeLoadIndex(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Load Details - {order.id}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Total: {order.load} load{order.load > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {Array.from({ length: order.load }, (_, i) => i + 1).map(
            (loadNum) => {
              const loadIndex = loadNum - 1;
              const pieceCount = loadPieces[loadIndex];
              const isEditingPiece = editingLoadIndex === loadIndex;
              const isEditingEmployee = editingEmployeeLoadIndex === loadIndex;
              const loadEmployeeIds = loadEmployees[loadIndex] || [];
              const loadEmployeeNames = employees
                .filter(emp => loadEmployeeIds.includes(emp.id))
                .map(emp => emp.first_name || 'Employee')
                .join(', ') || 'No employees assigned';

              return (
                <AccordionItem
                  key={loadNum}
                  value={`load-${loadNum}`}
                  className={cn(
                    'border rounded-lg overflow-hidden',
                    (isEditingPiece || isEditingEmployee)
                      ? 'bg-primary/5 border-primary'
                      : 'bg-muted/30'
                  )}
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                        {loadNum}
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="font-semibold text-sm">Load {loadNum}</span>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span><span className="font-medium">ORDER #:</span> {order.id}</span>
                          <span><span className="font-medium">Date:</span> {format(order.orderDate, 'MMM dd, yyyy')}</span>
                          <span><span className="font-medium">Name:</span> {order.customerName}</span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2">

                  {/* Employee Assignment */}
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Employee:</span>
                      </div>
                      {!isEditingEmployee && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => setEditingEmployeeLoadIndex(loadIndex)}
                          disabled={isSaving || isEditingPiece}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {isEditingEmployee ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {employees.map((emp) => {
                            const isSelected = loadEmployeeIds.includes(emp.id);
                            return (
                              <Button
                                key={emp.id}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleEmployeeToggle(loadIndex, emp.id)}
                                disabled={isSaving || loadingEmployees}
                                className={cn(
                                  "h-7 text-xs",
                                  isSelected 
                                    ? "bg-primary hover:bg-primary/90" 
                                    : "hover:border-primary hover:text-primary"
                                )}
                              >
                                {emp.first_name || 'Employee'}
                              </Button>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleEmployeeSave(loadIndex)}
                            disabled={isSaving || (() => {
                              const originalEmployees = order.assignedEmployeeIds || 
                                (order.assignedEmployeeId ? [order.assignedEmployeeId] : null);
                              const currentEmployees = loadEmployees[loadIndex];
                              const originalIds = originalEmployees?.slice().sort().join(',') || '';
                              const currentIds = currentEmployees?.slice().sort().join(',') || '';
                              return originalIds === currentIds;
                            })()}
                          >
                            {isSaving ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleEmployeeEditCancel(loadIndex)}
                            disabled={isSaving}
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-foreground">
                        {loadEmployeeNames}
                      </div>
                    )}
                  </div>

                  {/* Piece Count */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Piece Count:</span>
                      {!isEditingPiece && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleEditPieceStart(loadIndex)}
                          disabled={isSaving || isEditingEmployee}
                          title="Edit piece count"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {isEditingPiece ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={editingPieceValue}
                          onChange={(e) => setEditingPieceValue(e.target.value)}
                          placeholder="Enter pieces"
                          className="h-8 text-xs w-32"
                          disabled={isSaving}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handlePieceSave(loadIndex);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              handleEditPieceCancel();
                            }
                          }}
                        />
                        <span className="text-xs text-muted-foreground">pcs</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => handlePieceSave(loadIndex)}
                          disabled={isSaving || (() => {
                            const currentValue = loadPieces[loadIndex];
                            const newValue = editingPieceValue.trim() === '' ? null : Number(editingPieceValue);
                            return currentValue === newValue || (newValue !== null && isNaN(newValue));
                          })()}
                        >
                          {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={handleEditPieceCancel}
                          disabled={isSaving}
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-foreground">
                        {pieceCount !== null && pieceCount !== undefined ? (
                          `${pieceCount} ${pieceCount === 1 ? 'piece' : 'pieces'}`
                        ) : (
                          <span className="italic text-muted-foreground">No piece count recorded</span>
                        )}
                      </div>
                    )}
                  </div>
                  </AccordionContent>
                </AccordionItem>
              );
            }
          )}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
