"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  title?: string;
  description?: string;
  itemName?: string;
  onConfirm: () => void;
  variant?: "danger" | "warning";
  buttonSize?: "sm" | "default" | "lg" | "icon";
  buttonText?: string | null;
  buttonIcon?: boolean;
}

export function DeleteConfirmationDialog({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  itemName,
  onConfirm,
  variant = "danger",
  buttonSize = "sm",
  buttonText = null,
  buttonIcon = true,
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const getButtonClass = () => {
    if (variant === "danger") {
      return "bg-gray-500 hover:bg-red-600 text-white hover:text-white";
    }
    return "text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200";
  };

  const getButtonSize = () => {
    if (buttonSize === "icon") {
      return "h-8 w-8 p-0";
    }
    return "";
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size={buttonSize === "icon" ? "icon" : buttonSize}
        className={`bg-gray-500 hover:bg-red-600 text-white hover:text-white ${getButtonClass()} ${getButtonSize()}`}
      >
        {buttonIcon && (
          <Trash2
            className={buttonSize === "icon" ? "h-4 w-4" : "h-4 w-4 mr-2"}
          />
        )}
        {buttonText}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-md bg-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  variant === "danger" ? "bg-red-100" : "bg-amber-100"
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 ${
                    variant === "danger" ? "text-red-600" : "text-amber-600"
                  }`}
                />
              </div>
              <AlertDialogTitle>{title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              {description}
              {itemName && (
                <div className="mt-2 font-medium text-foreground">
                  <span className="font-normal text-muted-foreground">
                    Item:{" "}
                  </span>
                  {itemName}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
