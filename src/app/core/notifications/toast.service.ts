import { Injectable, signal } from "@angular/core";

export type ToastKind = "success" | "error" | "info";
export interface ToastMessage {
  id: number;
  kind: ToastKind;
  title: string;
  message: string;
}

@Injectable({ providedIn: "root" })
export class ToastService {
  private readonly items = signal<ToastMessage[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;
  readonly messages = this.items.asReadonly();

  show(kind: ToastKind, title: string, message: string): void {
    if (
      this.items().some(
        (item) => item.kind === kind && item.message === message,
      )
    )
      return;
    if (this.items().length >= 4) this.dismiss(this.items()[0].id);
    const id = ++this.nextId;
    this.items.update((items) => [...items, { id, kind, title, message }]);
    this.timers.set(
      id,
      setTimeout(() => this.dismiss(id), kind === "error" ? 10000 : 6000),
    );
  }

  dismiss(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.items.update((items) => items.filter((item) => item.id !== id));
  }
}
