package tree_sitter_typescript_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_typescript "github.com/fxti/tree-sitter-typescript/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_typescript.Language())
	if language == nil {
		t.Errorf("Error loading Typescript grammar")
	}
}
