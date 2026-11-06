import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  signal,
  input,
  SecurityContext,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'iw-admin-answer-editor',
  templateUrl: './answer-editor.html',
  styleUrl: './answer-editor.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AnswerEditor), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerEditor implements ControlValueAccessor {
  private readonly sanitizer = inject(DomSanitizer);
  readonly initial = signal('');
  readonly readOnly = input(false);
  readonly disabled = signal(false);
  private changed: (value: string) => void = () => {};
  touched: () => void = () => {};
  writeValue(value: string) {
    this.initial.set(value || '');
  }
  registerOnChange(fn: (value: string) => void) {
    this.changed = fn;
  }
  registerOnTouched(fn: () => void) {
    this.touched = fn;
  }
  setDisabledState(value: boolean) {
    this.disabled.set(value);
  }
  update(editor: HTMLElement) {
    this.changed(this.sanitizer.sanitize(SecurityContext.HTML, editor.innerHTML) || '');
  }
  format(editor: HTMLElement, tag: string) {
    if (this.disabled() || this.readOnly()) return;
    const selection = window.getSelection();
    if (
      !selection?.rangeCount ||
      !editor.contains(selection.anchorNode) ||
      !editor.contains(selection.focusNode)
    ) {
      editor.focus();
      return;
    }
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const element = document.createElement(tag);
    if (tag === 'ul') {
      const li = document.createElement('li');
      li.append(range.extractContents());
      element.append(li);
    } else element.append(range.extractContents());
    range.insertNode(element);
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    this.update(editor);
    this.touched();
  }
  paste(event: ClipboardEvent, editor: HTMLElement) {
    event.preventDefault();
    if (this.disabled() || this.readOnly()) return;
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editor.contains(selection.anchorNode)) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(event.clipboardData?.getData('text/plain') || '');
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    this.update(editor);
  }
}
