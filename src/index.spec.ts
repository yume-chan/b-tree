import { describe, expect, it } from "@jest/globals";

import type { BTreeNode } from "./index.js";
import { BTree } from "./index.js";

const LENGTH = 128;

function shuffle<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = (Math.random() * (i + 1)) | 0;
        [array[i], array[j]] = [array[j]!, array[i]!];
    }
}

describe("BTree", () => {
    function validateNode(node: BTreeNode, root: boolean, min = -Infinity) {
        if (node.height === 0) {
            expect(node.keyCount).toBeGreaterThan(0);
            expect(node.keyCount).toBeLessThan(node.order);
            for (let i = 0; i < node.keyCount; i += 1) {
                expect(node.keys[i]).toBeGreaterThan(min);
                min = node.keys[i]!;
            }
            return min;
        }

        if (!root) {
            // Math.ceil(order / 2) - 1
            expect(node.keyCount).toBeGreaterThanOrEqual(
                ((node.order + 1) >> 1) - 1,
            );
        }
        expect(node.keyCount).toBeLessThan(node.order);

        for (let i = 0; i < node.keyCount; i += 1) {
            min = validateNode(node.children[i]!, false, min);
            expect(node.keys[i]).toBeGreaterThan(min);
            min = node.keys[i]!;
        }
        min = validateNode(node.children[node.keyCount]!, false, min);
        return min;
    }

    function validateTree(tree: BTree) {
        if (tree.size === 0) {
            expect(tree.root.keyCount).toBe(0);
            return;
        }

        validateNode(tree.root, true);
    }

    for (let order = 3; order < 10; order += 1) {
        describe(`order ${order}`, () => {
            it("should return correct order", () => {
                const tree = new BTree(order);
                expect(tree.order).toBe(order);
            });

            it("should generate valid tree with incremental values", () => {
                const tree = new BTree(order);

                const values = Array.from(
                    { length: LENGTH },
                    (_, i) => i - LENGTH / 2,
                );
                for (const value of values) {
                    tree.add(value);
                    validateTree(tree);
                    expect(tree.has(value)).toBe(true);
                }

                for (const value of values) {
                    tree.delete(value);
                    validateTree(tree);
                    expect(tree.has(value)).toBe(false);
                }
            });

            it("should generate valid tree with random values", () => {
                const tree = new BTree(order);

                const values = Array.from(
                    { length: LENGTH },
                    (_, i) => i - LENGTH / 2,
                );
                shuffle(values);
                for (const value of values) {
                    tree.add(value);
                    validateTree(tree);
                    expect(tree.has(value)).toBe(true);
                }

                shuffle(values);
                for (const value of values) {
                    tree.delete(value);
                    validateTree(tree);
                    expect(tree.has(value)).toBe(false);
                }
            });
        });
    }

    describe("add", () => {
        it("should return `true` for new values", () => {
            const tree = new BTree(5);
            expect(tree.add(1)).toBe(true);
            expect(tree.add(2)).toBe(true);
        });

        it("should return `false` for duplicate values", () => {
            const tree = new BTree(5);
            expect(tree.add(1)).toBe(true);
            expect(tree.add(1)).toBe(false);
        });
    });

    describe("delete", () => {
        it("should return `true` for existing values", () => {
            const tree = new BTree(5);
            tree.add(1);
            expect(tree.delete(1)).toBe(true);
        });

        it("should return `false` for non-existing values", () => {
            const tree = new BTree(5);
            expect(tree.delete(1)).toBe(false);
        });
    });

    describe("clear", () => {
        it("should clear the tree", () => {
            const tree = new BTree(5);
            tree.add(1);
            tree.add(2);
            tree.clear();
            expect(tree.size).toBe(0);
            validateTree(tree);
        });
    });

    describe("iterate", () => {
        it("should iterate in order", () => {
            const tree = new BTree(5);

            const values = Array.from(
                { length: LENGTH },
                (_, i) => i - LENGTH / 2,
            );
            shuffle(values);
            for (const value of values) {
                tree.add(value);
            }

            let prev = -Infinity;
            let count = 0;
            for (const value of tree) {
                expect(value).toBeGreaterThan(prev);
                expect(values).toContain(value);
                prev = value;
                count += 1;
            }
            expect(count).toBe(LENGTH);
        });
    });
});
