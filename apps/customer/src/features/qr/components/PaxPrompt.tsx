import React, { useState } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';

interface PaxPromptProps {
  tableId: string;
  onConfirm: (pax: number, isToGo: boolean) => void;
  onSkip: () => void;
}

export const PaxPrompt: React.FC<PaxPromptProps> = ({ tableId, onConfirm, onSkip }) => {
  const [pax, setPax] = useState<number>(1);
  const [orderType, setOrderType] = useState<'dine-in' | 'to-go'>('dine-in');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pax > 0) {
      onConfirm(pax, orderType === 'to-go');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onSkip}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center">
          <UserGroupIcon className="w-16 h-16 text-primary mx-auto mb-4" />
          <DialogTitle className="text-2xl font-bold">Welcome!</DialogTitle>
          <DialogDescription>
            You're seated at <span className="font-semibold">{tableId}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Order Type
            </label>
            <RadioGroup
              value={orderType}
              onValueChange={(value) => setOrderType(value as 'dine-in' | 'to-go')}
              className="grid grid-cols-2 gap-3"
            >
              <label
                htmlFor="dine-in"
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                  orderType === 'dine-in'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="dine-in" id="dine-in" className="sr-only" />
                <span>Dine In</span>
              </label>
              <label
                htmlFor="to-go"
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                  orderType === 'to-go'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="to-go" id="to-go" className="sr-only" />
                <span>To Go</span>
              </label>
            </RadioGroup>
          </div>

          <div>
            <label htmlFor="pax" className="block text-sm font-medium text-foreground mb-2">
              How many people are dining?
            </label>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPax(Math.max(1, pax - 1))}
                className="w-10 h-10 rounded-full"
                disabled={pax <= 1}
              >
                <span className="text-lg font-medium">-</span>
              </Button>
              
              <div className="flex-1 text-center">
                <Input
                  type="number"
                  id="pax"
                  min="1"
                  max="20"
                  value={pax}
                  onChange={(e) => setPax(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center text-2xl font-bold border-none outline-none mx-auto"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {pax === 1 ? 'person' : 'people'}
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPax(Math.min(20, pax + 1))}
                className="w-10 h-10 rounded-full"
                disabled={pax >= 20}
              >
                <span className="text-lg font-medium">+</span>
              </Button>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          This helps us prepare the right portions and serve you better
        </p>
      </DialogContent>
    </Dialog>
  );
};
