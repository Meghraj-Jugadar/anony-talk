import { Component, Output, EventEmitter, ElementRef, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import 'emoji-picker-element';

@Component({
  selector: 'app-emoji-picker',
  imports: [NgIf, NgClass],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './emoji-picker.html',
})
export class EmojiPicker {
  @Output() emojiSelect = new EventEmitter<string>();

  open = false;
  position = { top: false, bottom: false, left: false, right: false };

  constructor(private el: ElementRef) {}

  toggle() {
    this.open = !this.open;
    if (this.open) this.calculatePosition();
  }

  close() { this.open = false; }

  calculatePosition() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const pickerWidth = 320;
    const pickerHeight = 380;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = viewportWidth - rect.left;

    this.position = {
      top: spaceBelow < pickerHeight && spaceAbove > pickerHeight,
      bottom: spaceBelow >= pickerHeight || spaceAbove <= pickerHeight,
      left: spaceRight < pickerWidth,
      right: spaceRight >= pickerWidth,
    };
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }

  onEmojiClick(event: any) {
    this.emojiSelect.emit(event.detail.unicode);
    this.close();
  }
}
