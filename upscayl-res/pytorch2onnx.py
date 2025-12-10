import argparse
import torch
import torch.onnx
from basicsr.archs.rrdbnet_arch import RRDBNet


def main(args):
    # An instance of the model
    # Default: 23 blocks for RealESRGAN_x4plus
    # Use 6 blocks for anime models (_6B suffix)
    num_block = args.num_block if hasattr(args, 'num_block') else 23
    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=num_block, num_grow_ch=32, scale=4)
    
    # Load checkpoint
    checkpoint = torch.load(args.input, map_location='cpu')
    
    # Try different possible keys
    if 'params_ema' in checkpoint:
        keyname = 'params_ema'
    elif 'params' in checkpoint:
        keyname = 'params'
    elif 'state_dict' in checkpoint:
        keyname = 'state_dict'
    else:
        # Checkpoint might be the state_dict directly
        keyname = None
    
    if keyname:
        model.load_state_dict(checkpoint[keyname])
    else:
        model.load_state_dict(checkpoint)
    # set the train mode to false since we will only run the forward pass.
    model.train(False)
    model.cpu().eval()

    # An example input (shape only used to trace; actual input dims will be dynamic)
    x = torch.rand(1, 3, 64, 64)
    # Export the model with dynamic spatial dims so H/W are not fixed to 64
    with torch.no_grad():
        torch_out = torch.onnx.export(
            model,
            x,
            args.output,
            opset_version=11,
            export_params=True,
            input_names=["input"],
            output_names=["output"],
            dynamic_axes={
                "input": {0: "batch", 2: "height", 3: "width"},
                "output": {0: "batch", 2: "out_height", 3: "out_width"},
            },
        )
    print(torch_out)


if __name__ == '__main__':
    """Convert pytorch model to onnx models"""
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--input', type=str, default='experiments/pretrained_models/RealESRGAN_x4plus.pth', help='Input model path')
    parser.add_argument('--output', type=str, default='realesrgan-x4.onnx', help='Output onnx path')
    parser.add_argument('--num_block', type=int, default=23, help='Number of RRDB blocks (23 for standard, 6 for anime models)')
    parser.add_argument('--params', action='store_false', help='Use params instead of params_ema')
    args = parser.parse_args()

    main(args)