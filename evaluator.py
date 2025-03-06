#!/usr/bin/env python3
"""
Tree-sitter Grammar Testing Script

Usage:
    python test_grammar.py <should_parse_dir> <should_not_parse_dir>

This script tests a tree-sitter grammar by running it on two sets of files:
- Files that should parse successfully
- Files that should fail to parse
"""

import os
import json
import subprocess
import multiprocessing
from multiprocessing import Pool
from tqdm import tqdm
import argparse
import time

def find_files(directory, extensions=None):
    """递归查找指定扩展名的文件"""
    if not os.path.exists(directory):
        print(f"Error: Directory not found: {directory}")
        return []
        
    if extensions is None:
        extensions = ['.js', '.ts', '.tsx', '.jsx']
    
    files = []
    for root, dirs, filenames in os.walk(directory):            
        for filename in filenames:
            if any(filename.endswith(ext) for ext in extensions):
                files.append(os.path.join(root, filename))
    
    return files

def test_file(args):
    """测试单个文件是否能被 tree-sitter 成功解析"""
    file_path, expected_success = args
    # 调用 tree-sitter parse 命令
    result = subprocess.run(
        ["tree-sitter", "parse", file_path],
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE
    )
    
    # 检查解析是否成功
    # tree-sitter parse 在解析失败时返回非零状态码
    actual_success = result.returncode == 0
    
    return {
        "file_path": file_path,
        "expected_success": expected_success,
        "actual_success": actual_success,
        "success": expected_success == actual_success
    }

def process_directory(directory, expected_success, extensions=None):
    """处理一个目录中的所有文件"""
    files = find_files(directory, extensions)
    if not files:
        print(f"No files found in {directory}")
        return [], {}
    
    # 创建任务参数列表
    tasks = [(file_path, expected_success) for file_path in files]
    
    # 统计结果
    stats = {
        "total": len(files),
        "passed": 0,
        "failed": 0,
        "failed_files": []
    }
    
    # 创建进程池
    cpu_count = os.cpu_count()
    results = []
    
    print(f"Testing {len(files)} files in {directory}")
    with Pool(processes=cpu_count) as pool:
        # 使用tqdm显示进度
        for result in tqdm(pool.imap_unordered(test_file, tasks), total=len(tasks), desc=f"Files that should{'nt' if not expected_success else ''} parse"):
            results.append(result)
            if result["success"]:
                stats["passed"] += 1
            else:
                stats["failed"] += 1
                stats["failed_files"].append(result["file_path"])
    
    return results, stats

def print_stats(stats_should_pass, stats_should_fail):
    """打印测试统计信息"""
    print("\n===== Test Results =====")
    
    # 应该成功的测试
    pass_rate = (stats_should_pass["passed"] / stats_should_pass["total"]) * 100 if stats_should_pass["total"] > 0 else 0
    print(f"Should parse successfully:")
    print(f"  Passed: {stats_should_pass['passed']}/{stats_should_pass['total']} ({pass_rate:.1f}%)")
    
    # 应该失败的测试
    fail_rate = (stats_should_fail["passed"] / stats_should_fail["total"]) * 100 if stats_should_fail["total"] > 0 else 0
    print(f"Should fail to parse:")
    print(f"  Passed: {stats_should_fail['passed']}/{stats_should_fail['total']} ({fail_rate:.1f}%)")
    
    # 总体结果
    total_tests = stats_should_pass["total"] + stats_should_fail["total"]
    total_passed = stats_should_pass["passed"] + stats_should_fail["passed"]
    total_rate = (total_passed / total_tests) * 100 if total_tests > 0 else 0
    
    print(f"\nOverall:")
    print(f"  Passed: {total_passed}/{total_tests} ({total_rate:.1f}%)")

def save_results(results_should_pass, results_should_fail, stats_should_pass, stats_should_fail):
    """保存测试结果到文件"""
    # 收集所有失败的测试
    failed_tests = []
    for result in results_should_pass:
        if not result["success"]:
            failed_tests.append({
                "file": result["file_path"],
                "expected": "pass",
                "actual": "fail",
            })
    
    for result in results_should_fail:
        if not result["success"]:
            failed_tests.append({
                "file": result["file_path"],
                "expected": "fail",
                "actual": "pass",
            })
    
    # 如果有失败的测试，保存详细信息
    if failed_tests:
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        report_file = f"tree-sitter-test-report-{timestamp}.json"
        
        report = {
            "timestamp": timestamp,
            "stats": {
                "should_pass": {
                    "total": stats_should_pass["total"],
                    "passed": stats_should_pass["passed"],
                    "failed": stats_should_pass["failed"]
                },
                "should_fail": {
                    "total": stats_should_fail["total"],
                    "passed": stats_should_fail["passed"],
                    "failed": stats_should_fail["failed"]
                }
            },
            "failed_tests": failed_tests
        }
        
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
            
        print(f"\nFailed tests: {len(failed_tests)}")
        print(f"Detailed report saved to: {report_file}")
        
        # 打印一些失败的文件路径
        should_pass_fails = [t for t in failed_tests if t["expected"] == "pass"]
        should_fail_fails = [t for t in failed_tests if t["expected"] == "fail"]
        
        if should_pass_fails:
            print(f"\nSample files that should parse but failed ({len(should_pass_fails)}):")
            for i, test in enumerate(should_pass_fails[:5]):
                print(f"  {i+1}. {test['file']}")
            if len(should_pass_fails) > 5:
                print(f"  ... and {len(should_pass_fails) - 5} more")
                
        if should_fail_fails:
            print(f"\nSample files that should fail but parsed ({len(should_fail_fails)}):")
            for i, test in enumerate(should_fail_fails[:5]):
                print(f"  {i+1}. {test['file']}")
            if len(should_fail_fails) > 5:
                print(f"  ... and {len(should_fail_fails) - 5} more")
        
        return report_file
    
    return None

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="Test tree-sitter grammar on success and failure cases")
    parser.add_argument("should_parse_dir", help="Directory with files that should parse successfully")
    parser.add_argument("should_not_parse_dir", help="Directory with files that should fail to parse")
    parser.add_argument("-e", "--extensions", nargs="+", default=['.js', '.ts', '.tsx', '.jsx'],
                      help="File extensions to test (default: .js .ts .tsx .jsx)")
    args = parser.parse_args()
    
    print("Tree-sitter Grammar Tester")
    print(f"Testing file extensions: {', '.join(args.extensions)}")
    
    start_time = time.time()
    
    # 处理应该成功的目录
    print("\nProcessing files that should parse successfully...")
    results_should_pass, stats_should_pass = process_directory(
        args.should_parse_dir, True, args.extensions
    )
    
    # 处理应该失败的目录
    print("\nProcessing files that should fail to parse...")
    results_should_fail, stats_should_fail = process_directory(
        args.should_not_parse_dir, False, args.extensions
    )
    
    # 打印统计
    print_stats(stats_should_pass, stats_should_fail)
    
    # 保存结果
    report_file = save_results(
        results_should_pass, results_should_fail,
        stats_should_pass, stats_should_fail
    )
    
    # 计算运行时间
    elapsed = time.time() - start_time
    print(f"\nTotal runtime: {elapsed:.2f} seconds")

if __name__ == "__main__":
    # 在Windows上需要保护主入口点
    multiprocessing.freeze_support()
    main()