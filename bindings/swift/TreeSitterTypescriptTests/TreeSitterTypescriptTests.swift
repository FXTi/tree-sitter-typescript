import XCTest
import SwiftTreeSitter
import TreeSitterTypescript

final class TreeSitterTypescriptTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_typescript())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Typescript grammar")
    }
}
