import onnx
import onnxruntime as ort
import numpy as np

def verify_onnx_model(model_path):
    print(f"🔍 验证 ONNX 模型: {model_path}\n")
    
    # 1. 加载并检查模型
    try:
        model = onnx.load(model_path)
        onnx.checker.check_model(model)
        print("✅ 模型格式验证通过")
    except Exception as e:
        print(f"❌ 模型格式验证失败:  {e}")
        return False
    
    # 2. 打印模型信息
    print(f"\n📊 模型信息:")
    print(f"   IR 版本: {model.ir_version}")
    print(f"   Opset 版本: {model.opset_import[0].version}")
    
    # 3. 打印输入输出信息
    print(f"\n📥 输入信息:")
    for input_tensor in model.graph.input:
        print(f"   名称: {input_tensor.name}")
        shape = [dim.dim_value if dim.dim_value > 0 else dim.dim_param 
                 for dim in input_tensor.type.tensor_type.shape.dim]
        print(f"   形状: {shape}")
        print(f"   类型: {input_tensor.type.tensor_type.elem_type}")
    
    print(f"\n📤 输出信息:")
    for output_tensor in model.graph.output:
        print(f"   名称: {output_tensor. name}")
        shape = [dim.dim_value if dim.dim_value > 0 else dim.dim_param 
                 for dim in output_tensor.type.tensor_type.shape.dim]
        print(f"   形状: {shape}")
        print(f"   类型:  {output_tensor.type.tensor_type.elem_type}")
    
    # 4. 使用 ONNXRuntime 测试推理
    print(f"\n🧪 测试推理:")
    try:
        session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
        
        # 测试不同尺寸的输入
        test_sizes = [(64, 64), (128, 128), (256, 256)]
        
        for h, w in test_sizes: 
            # 创建随机输入
            input_data = np.random.rand(1, 3, h, w).astype(np.float32)
            
            # 运行推理
            input_name = session.get_inputs()[0].name
            output_name = session.get_outputs()[0].name
            result = session.run([output_name], {input_name: input_data})
            
            output_shape = result[0].shape
            expected_h, expected_w = h * 4, w * 4
            
            if output_shape[2] == expected_h and output_shape[3] == expected_w:
                print(f"   ✅ {h}x{w} -> {output_shape[2]}x{output_shape[3]} (正确)")
            else:
                print(f"   ❌ {h}x{w} -> {output_shape[2]}x{output_shape[3]} (预期: {expected_h}x{expected_w})")
                return False
        
        print("\n✅ 所有测试通过！模型支持动态尺寸输入")
        return True
        
    except Exception as e: 
        print(f"   ❌ 推理测试失败: {e}")
        return False

if __name__ == "__main__": 
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python verify_onnx.py <model_path>")
        sys.exit(1)
    
    model_path = sys.argv[1]
    verify_onnx_model(model_path)
