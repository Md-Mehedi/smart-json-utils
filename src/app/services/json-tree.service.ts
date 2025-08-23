import { Injectable } from '@angular/core';
import { JsonNode } from '../shared/interfaces/json-data.interface';

@Injectable({
  providedIn: 'root'
})
export class JsonTreeService {

  /**
   * Converts JSON object to a tree structure for rendering
   */
  jsonToTree(obj: any, key?: string, depth = 0): JsonNode {
    const node: JsonNode = {
      key,
      value: obj,
      type: this.getValueType(obj),
      depth,
      expanded: depth < 2 // Auto-expand first 2 levels
    };

    if (node.type === 'object' || node.type === 'array') {
      node.children = this.getChildren(obj, depth + 1);
    }

    return node;
  }

  /**
   * Generates HTML string for the JSON tree
   */
  generateTreeHtml(node: JsonNode): string {
    const indent = '  '.repeat(node.depth);
    const keyHtml = node.key ? `<span class="json-key">"${this.escapeHtml(node.key)}"</span><span class="json-colon">: </span>` : '';

    if (node.type === 'null') {
      return `<div class="json-node">${indent}${keyHtml}<span class="json-null">null</span></div>`;
    }

    if (node.type === 'string') {
      return `<div class="json-node">${indent}${keyHtml}<span class="json-string">"${this.escapeHtml(String(node.value))}"</span></div>`;
    }

    if (node.type === 'number') {
      return `<div class="json-node">${indent}${keyHtml}<span class="json-number">${node.value}</span></div>`;
    }

    if (node.type === 'boolean') {
      return `<div class="json-node">${indent}${keyHtml}<span class="json-boolean">${node.value}</span></div>`;
    }

    if (node.type === 'array') {
      if (!node.children || node.children.length === 0) {
        return `<div class="json-node">${indent}${keyHtml}<span class="json-bracket">[]</span></div>`;
      }

      const toggleId = this.generateId();
      const toggleClass = node.expanded ? '' : 'collapsed';
      const childrenClass = node.expanded ? '' : 'collapsed';

      let html = `<div class="json-node">
        ${indent}${keyHtml}<span class="json-toggle ${toggleClass}" data-toggle="${toggleId}">
          <span class="json-toggle-icon"><i class="fas fa-chevron-down"></i></span>
          <span class="json-bracket">[</span>
        </span>
        <div class="json-children ${childrenClass}" data-children="${toggleId}">`;

      node.children.forEach((child, index) => {
        const childHtml = this.generateTreeHtml(child);
        if (index < node.children!.length - 1) {
          html += childHtml.replace('</div>', '<span class="json-comma">,</span></div>');
        } else {
          html += childHtml;
        }
      });

      html += `</div>
        ${indent}<span class="json-bracket">]</span>
      </div>`;

      return html;
    }

    if (node.type === 'object') {
      if (!node.children || node.children.length === 0) {
        return `<div class="json-node">${indent}${keyHtml}<span class="json-bracket">{}</span></div>`;
      }

      const toggleId = this.generateId();
      const toggleClass = node.expanded ? '' : 'collapsed';
      const childrenClass = node.expanded ? '' : 'collapsed';

      let html = `<div class="json-node">
        ${indent}${keyHtml}<span class="json-toggle ${toggleClass}" data-toggle="${toggleId}">
          <span class="json-toggle-icon"><i class="fas fa-chevron-down"></i></span>
          <span class="json-bracket">{</span>
        </span>
        <div class="json-children ${childrenClass}" data-children="${toggleId}">`;

      node.children.forEach((child, index) => {
        const childHtml = this.generateTreeHtml(child);
        if (index < node.children!.length - 1) {
          html += childHtml.replace('</div>', '<span class="json-comma">,</span></div>');
        } else {
          html += childHtml;
        }
      });

      html += `</div>
        ${indent}<span class="json-bracket">}</span>
      </div>`;

      return html;
    }

    return `<div class="json-node">${indent}${keyHtml}<span class="json-value">${String(node.value)}</span></div>`;
  }

  /**
   * Attaches event listeners to toggle buttons in the tree
   */
  attachTreeEventListeners(container: HTMLElement): void {
    const toggles = container.querySelectorAll('.json-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const toggleId = toggle.getAttribute('data-toggle');
        const children = container.querySelector(`[data-children="${toggleId}"]`);

        if (children) {
          toggle.classList.toggle('collapsed');
          children.classList.toggle('collapsed');
        }
      });
    });
  }

  /**
   * Expands all nodes in the tree
   */
  expandAll(container: HTMLElement): void {
    const toggles = container.querySelectorAll('.json-toggle.collapsed');
    toggles.forEach(toggle => {
      toggle.classList.remove('collapsed');
      const toggleId = toggle.getAttribute('data-toggle');
      const children = container.querySelector(`[data-children="${toggleId}"]`);
      if (children) {
        children.classList.remove('collapsed');
      }
    });
  }

  /**
   * Collapses all nodes in the tree
   */
  collapseAll(container: HTMLElement): void {
    const toggles = container.querySelectorAll('.json-toggle:not(.collapsed)');
    toggles.forEach(toggle => {
      toggle.classList.add('collapsed');
      const toggleId = toggle.getAttribute('data-toggle');
      const children = container.querySelector(`[data-children="${toggleId}"]`);
      if (children) {
        children.classList.add('collapsed');
      }
    });
  }

  /**
   * Gets children nodes for objects and arrays
   */
  private getChildren(obj: any, depth: number): JsonNode[] {
    const children: JsonNode[] = [];

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        children.push(this.jsonToTree(item, undefined, depth));
      });
    } else if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj).sort(); // Sort keys alphabetically
      keys.forEach(key => {
        children.push(this.jsonToTree(obj[key], key, depth));
      });
    }

    return children;
  }

  /**
   * Determines the type of a value
   */
  private getValueType(value: any): JsonNode['type'] {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value as JsonNode['type'];
  }

  /**
   * Escapes HTML characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Generates a unique ID for toggle elements
   */
  private generateId(): string {
    return `toggle-${Math.random().toString(36).substr(2, 9)}`;
  }
} 